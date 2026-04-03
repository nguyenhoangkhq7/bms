package fit.iuh.filter;

import fit.iuh.service.Jwt;
import fit.iuh.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@AllArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
   private final JwtService jwtService;

   @Override
   protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
      String authHeader = request.getHeader("Authorization");

      // khi login hoặc truy cập public content
      if(authHeader==null || !authHeader.startsWith("Bearer ")) {
         System.out.println("here 1");
         filterChain.doFilter(request, response);
         return;
      }
      String token = authHeader.replace("Bearer ", "");
      Jwt jwt = jwtService.parseToken(token);

      if(jwt == null || jwt.isExpirated()) {
         filterChain.doFilter(request, response);
         return;
      }
      var authentication = new UsernamePasswordAuthenticationToken(
              jwt.getUserIdFromToken(),
              null,
              List.of(new SimpleGrantedAuthority("ROLE_" + jwt.getRoleFromToken().name()))
      );
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
      filterChain.doFilter(request, response);

   }
}
