package fit.iuh.config;

import fit.iuh.filter.JwtAuthFilter;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {
   private final JwtAuthFilter jwtAuthFilter;
   private final List<SecurityRules> featureSecurityRules;

   @Bean
   public PasswordEncoder passwordEncoder() {
      return new LegacyAwarePasswordEncoder();
   }

   @Bean
   public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
      return config.getAuthenticationManager();
   }

   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
      http
              .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
              .csrf(AbstractHttpConfigurer::disable)
              .authorizeHttpRequests(c -> {
                  featureSecurityRules.forEach(r -> r.configure(c));
                  c.anyRequest().authenticated();

                }
              )
              .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
              .exceptionHandling(c -> {
                 c.accessDeniedHandler((req, rsp, e)
                         -> rsp.sendError(HttpStatus.FORBIDDEN.value()));
                 c.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED));
              })
              .securityContext(context -> context.requireExplicitSave(false));
      return http.build();
   }
}
