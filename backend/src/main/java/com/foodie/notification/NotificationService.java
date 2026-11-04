package com.foodie.notification;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.event.*;

@Service
public class NotificationService {
  private final NotificationRepository records;
  private final ApplicationEventPublisher events;
  private final JavaMailSender mail;

  @Value("${foodie.mail.enabled}")
  private boolean enabled;

  @Value("${foodie.mail.from}")
  private String from;

  public NotificationService(
      NotificationRepository records, ApplicationEventPublisher events, JavaMailSender mail) {
    this.records = records;
    this.events = events;
    this.mail = mail;
  }

  public record MailRequested(Long notificationId, String email, String subject, String body) {}

  public void queue(Long userId, String email, String subject, String text, String destination) {
    Notification note = new Notification();
    note.setUserId(userId);
    note.setTitle(subject);
    note.setText(subject.equals("Verify Foodie email") ? "Verification email requested" : text);
    note.setDestination(destination);
    note.setEmailStatus(enabled ? "QUEUED" : "DISABLED");
    note.setCreatedAt(Instant.now());
    records.saveAndFlush(note);
    if (enabled) events.publishEvent(new MailRequested(note.getId(), email, subject, text));
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void deliver(MailRequested event) {
    var note = records.findById(event.notificationId()).orElseThrow();
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(event.email());
      message.setSubject(event.subject());
      message.setText(event.body());
      mail.send(message);
      note.setEmailStatus("SENT");
    } catch (MailException failure) {
      note.setEmailStatus("FAILED");
      org.slf4j.LoggerFactory.getLogger(getClass())
          .warn("Notification {} SMTP delivery failed", note.getId());
    }
    records.save(note);
  }
}
