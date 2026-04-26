package fit.iuh.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Supports legacy plain-text passwords from seeded data while keeping bcrypt for new passwords.
 */
public class LegacyAwarePasswordEncoder implements PasswordEncoder {
   private final BCryptPasswordEncoder bcryptPasswordEncoder = new BCryptPasswordEncoder();

   @Override
   public String encode(CharSequence rawPassword) {
      return bcryptPasswordEncoder.encode(rawPassword);
   }

   @Override
   public boolean matches(CharSequence rawPassword, String storedPassword) {
      if (storedPassword == null) {
         return false;
      }

      if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
         return bcryptPasswordEncoder.matches(rawPassword, storedPassword);
      }

      return storedPassword.contentEquals(rawPassword);
   }
}
