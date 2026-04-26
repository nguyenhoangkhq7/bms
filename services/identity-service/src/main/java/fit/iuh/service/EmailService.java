package fit.iuh.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Gửi mã OTP quên mật khẩu đến email người dùng.
     */
    public void sendForgotPasswordOtp(String toEmail, String otp) {
        sendOtpEmail(toEmail, otp,
                "[BMS] Mã OTP Quên Mật Khẩu",
                "Bạn đã yêu cầu đặt lại mật khẩu.\n\n" +
                "Mã OTP của bạn là: " + otp + "\n\n" +
                "Mã này có hiệu lực trong 10 phút.\n" +
                "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này."
        );
    }

    /**
     * Gửi mã OTP đổi mật khẩu đến email người dùng.
     */
    public void sendChangePasswordOtp(String toEmail, String otp) {
        sendOtpEmail(toEmail, otp,
                "[BMS] Mã OTP Xác Nhận Đổi Mật Khẩu",
                "Bạn đã yêu cầu đổi mật khẩu.\n\n" +
                "Mã OTP xác nhận của bạn là: " + otp + "\n\n" +
                "Mã này có hiệu lực trong 10 phút.\n" +
                "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này."
        );
    }

    private void sendOtpEmail(String toEmail, String otp, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Đã gửi OTP email thành công đến: {}", toEmail);
        } catch (Exception e) {
            log.error("Gửi email thất bại đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email, vui lòng thử lại sau.");
        }
    }
}
