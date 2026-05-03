package fit.iuh.service;

import fit.iuh.dto.request.ChangePasswordRequest;
import fit.iuh.dto.request.ChangePasswordWithOtpRequest;
import fit.iuh.dto.request.ForgotPasswordConfirmRequest;
import fit.iuh.dto.request.ForgotPasswordRequest;
import fit.iuh.entity.InvalidatedToken;
import fit.iuh.entity.User;
import fit.iuh.repository.InvalidatedTokenRepository;
import fit.iuh.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Service
@AllArgsConstructor
@Slf4j
public class AuthService {
   private final UserRepository userRepository;
   private final PasswordEncoder passwordEncoder;
   private final JwtService jwtService;
   private final InvalidatedTokenRepository invalidatedTokenRepository;
   private final EmailService emailService;

   public User getCurrentUser() {
      var authentication = SecurityContextHolder.getContext().getAuthentication();
      assert authentication != null;
      var userId = (Long) authentication.getPrincipal();
      assert userId != null;
      return userRepository.findById(userId).orElseThrow();
   }

   // ================================================================
   // Đổi mật khẩu trực tiếp (cần đăng nhập, dùng mật khẩu cũ)
   // ================================================================
   public void changePassword(ChangePasswordRequest request) {
      User user = getCurrentUser();

      if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác");
      }

      if (!request.getNewPassword().equals(request.getConfirmPassword())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và xác nhận không khớp");
      }

      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      userRepository.save(user);
   }

   // ================================================================
   // Logout
   // ================================================================
   @Transactional
   public void logout(String rawToken) {
      Jwt jwt = jwtService.parseToken(rawToken);

      if (jwt == null || jwt.isExpirated()) {
         log.info("Token null hoặc đã hết hạn, không cần blacklist.");
         return;
      }

      String jti = jwt.getJtiFromToken();
      if (jti == null) {
         log.warn("Token không có jti, không thể blacklist.");
         return;
      }

      InvalidatedToken invalidated = InvalidatedToken.builder()
              .id(jti)
              .expiryTime(jwt.getExpirationFromToken())
              .build();
      invalidatedTokenRepository.save(invalidated);
      log.info("Đã blacklist thành công token (jti: {})", jti);
   }

   // ================================================================
   // Quên mật khẩu (Forgot Password via OTP)
   // ================================================================

   /**
    * Bước 1: Người dùng nhập email → Sinh OTP → Gửi email.
    */
   @Transactional
   public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
      User user = userRepository.findByEmail(request.getEmail())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với email này"));

      String otp = generateOtp();
      user.setOtpCode(otp);
      userRepository.save(user);

      emailService.sendForgotPasswordOtp(user.getEmail(), otp);
      log.info("Đã gửi OTP quên mật khẩu đến: {}", user.getEmail());
   }

   /**
    * Bước 2: Xác nhận OTP + đặt mật khẩu mới.
    */
   @Transactional
   public void confirmForgotPassword(ForgotPasswordConfirmRequest request) {
      User user = userRepository.findByEmail(request.getEmail())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

      if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn");
      }

      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      user.setOtpCode(null);
      userRepository.save(user);

      log.info("Đặt lại mật khẩu thành công qua OTP cho user: {}", user.getEmail());
   }

   // ================================================================
   // Đổi mật khẩu có OTP (Change Password via OTP khi đã đăng nhập)
   // ================================================================

   /**
    * Bước 1: Gửi OTP xác nhận đổi mật khẩu đến email của user đang đăng nhập.
    */
   @Transactional
   public void sendChangePasswordOtp() {
      User user = getCurrentUser();

      String otp = generateOtp();
      user.setOtpCode(otp);
      userRepository.save(user);

      emailService.sendChangePasswordOtp(user.getEmail(), otp);
      log.info("Đã gửi OTP đổi mật khẩu đến: {}", user.getEmail());
   }

   /**
    * Bước 2: Xác nhận OTP + đặt mật khẩu mới.
    */
   @Transactional
   public void confirmChangePassword(ChangePasswordWithOtpRequest request) {
      User user = userRepository.findByEmail(request.getEmail())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

      if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn");
      }

      if (!request.getNewPassword().equals(request.getConfirmPassword())) {
         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và xác nhận không khớp");
      }

      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      user.setOtpCode(null);
      userRepository.save(user);

      log.info("Đổi mật khẩu thành công qua OTP cho user: {}", user.getEmail());
   }

   // ================================================================
   // Utilities
   // ================================================================
   private String generateOtp() {
      return String.format("%06d", new SecureRandom().nextInt(1_000_000));
   }
}
