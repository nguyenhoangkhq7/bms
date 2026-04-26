package fit.iuh.service;

import fit.iuh.config.JwtConfig;
import fit.iuh.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
@AllArgsConstructor
public class JwtService {
   private final JwtConfig jwtConfig;

   // 3 PHƯƠNG THỨC BÊN DƯỚI LÀ DÀNH CHO CHƯA CÓ VÀ CẦN TẠO RA TOKEN
   public Jwt generateAccessToken(User user) {
      return generateToken(user, jwtConfig.getAccessTokenExpiration());
   }
   public Jwt generateRefreshToken(User user) {
      return generateToken(user, jwtConfig.getRefreshTokenExpiration());
   }
   private Jwt generateToken(User user, long expirationTime) {
      var claims = Jwts.claims()
              .subject(user.getId().toString())
              .add("email", user.getEmail())
              .add("name", user.getFullName())
              .add("role", user.getRole())
              .issuedAt(new Date())
              .expiration(new Date(System.currentTimeMillis() + 1000 * expirationTime)).build();

      return new Jwt(claims, jwtConfig.getSecretKey());
   }

   // DÀNH CHO ĐÃ CÓ TOKEN CẦN TẠO RA JWT ENTITIY ĐỂ SỬ DỤNG
   public Jwt parseToken(String authToken) {
      try {
         var claims = getClaims(authToken);
         return new Jwt(claims, jwtConfig.getSecretKey());
      } catch (JwtException e) {
         return null;
      }
   }

   private Claims getClaims(String authToken) {
      return Jwts.parser()
              .verifyWith(jwtConfig.getSecretKey())
              .build()
              .parseSignedClaims(authToken)
              .getPayload();
   }
}
