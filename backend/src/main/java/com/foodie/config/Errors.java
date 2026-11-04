package com.foodie.config;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class Errors {
  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ProblemDetail> invalid(Exception e) {
    return response(400, e.getMessage());
  }

  @ExceptionHandler(SecurityException.class)
  ResponseEntity<ProblemDetail> forbidden(Exception e) {
    return response(403, e.getMessage());
  }

  @ExceptionHandler({
    IllegalStateException.class,
    org.springframework.dao.DataIntegrityViolationException.class,
    org.springframework.orm.ObjectOptimisticLockingFailureException.class
  })
  ResponseEntity<ProblemDetail> conflict(Exception e) {
    return response(
        409,
        e instanceof IllegalStateException
            ? e.getMessage()
            : "Record already exists or was changed; refresh and retry");
  }

  private ResponseEntity<ProblemDetail> response(int code, String detail) {
    return ResponseEntity.status(code)
        .body(ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(code), detail));
  }
}
