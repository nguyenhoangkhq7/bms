package fit.iuh.config;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.stereotype.Component;

@Component
public class AuthSecurityRule implements SecurityRules{
   @Override
   public void configure(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry) {
      registry
              .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
              .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
              .requestMatchers(HttpMethod.POST, "/auth/logout").permitAll()
              .requestMatchers(HttpMethod.POST, "/auth/refresh").permitAll()
              // Quên mật khẩu: Không cần đăng nhập
              .requestMatchers(HttpMethod.POST, "/auth/forgot-password/send-otp").permitAll()
              .requestMatchers(HttpMethod.POST, "/auth/forgot-password/confirm").permitAll()
              // Đổi mật khẩu: Cần đăng nhập
              .requestMatchers(HttpMethod.POST, "/auth/change-password/send-otp").authenticated()
              .requestMatchers(HttpMethod.POST, "/auth/change-password/confirm").authenticated();
   }
}
