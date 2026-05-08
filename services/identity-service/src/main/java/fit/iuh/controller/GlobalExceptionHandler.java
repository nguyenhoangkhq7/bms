package fit.iuh.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {
   @ExceptionHandler(MethodArgumentNotValidException.class)
   public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
      FieldError first = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
      String message = first == null ? "Validation failed" : first.getDefaultMessage();
      return ResponseEntity.badRequest().body(Map.of("message", message));
   }

   @ExceptionHandler(DataIntegrityViolationException.class)
   public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
      return ResponseEntity.badRequest().body(Map.of("message", "Registration data already exists or is invalid"));
   }

   @ExceptionHandler(NoSuchElementException.class)
   public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException ex) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Resource not found"));
   }

   @ExceptionHandler(Exception.class)
   public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", ex.getMessage() == null ? "Internal server error" : ex.getMessage()));
   }
}
