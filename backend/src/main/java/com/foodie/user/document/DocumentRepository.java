package com.foodie.user.document;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
  java.util.List<Document> findByUserId(Long userId);

  java.util.Optional<Document> findByUserIdAndKind(Long userId, String kind);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Document x where x.id=:id")
  java.util.Optional<Document> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
