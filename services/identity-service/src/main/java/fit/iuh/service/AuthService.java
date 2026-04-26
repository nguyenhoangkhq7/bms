package fit.iuh.service;

import fit.iuh.dto.request.ChangePasswordRequest;
import fit.iuh.entity.InvalidatedToken;
import fit.iuh.entity.User;
import fit.iuh.repository.InvalidatedTokenRepository;
import fit.iuh.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@AllArgsConstructor
public class AuthService {
   private final UserRepository userRepository;
   private final PasswordEncoder passwordEncoder;
   private final JwtService jwtService;
   private final InvalidatedTokenRepository invalidatedTokenRepository;

   public User getCurrentUser() {
      var authentication = SecurityContextHolder.getContext().getAuthentication();
      assert authentication != null;
      var userId = (Long) authentication.getPrincipal();
      assert userId != null;
      return userRepository.findById(userId).orElseThrow();
   }

   public void changePassword(ChangePasswordRequest request) {
      User user = getCurrentUser();

      // 1. Kiểm tra mật khẩu cũ
      if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
      }

      // 2. Kiểm tra newPassword và confirmPassword có khớp không
      if (!request.getNewPassword().equals(request.getConfirmPassword())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirm password do not match");
      }

      // 3. Mã hóa và lưu mật khẩu mới
      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      userRepository.save(user);
   }

   /**
    * Logout: parse access token, lưu jti vào bảng blacklist.
    * @param rawToken chuỗi JWT thô (không có "Bearer " prefix)
    */
   public void logout(String rawToken) {
      Jwt jwt = jwtService.parseToken(rawToken);

      if (jwt == null || jwt.isExpirated()) {
         // Token đã hết hạn tự nhiên → không cần blacklist
         return;
      }

      String jti = jwt.getJtiFromToken();
      if (jti == null) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token does not contain a valid jti");
      }

      // Lưu vào blacklist
      InvalidatedToken invalidated = InvalidatedToken.builder()
              .id(jti)
              .expiryTime(jwt.getExpirationFromToken())
              .build();
      invalidatedTokenRepository.save(invalidated);
   }
}

