package fit.iuh.service;

import fit.iuh.config.JwtConfig;
import fit.iuh.entity.User;
import fit.iuh.repository.InvalidatedTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@AllArgsConstructor
public class JwtService {
   private final JwtConfig jwtConfig;
   private final InvalidatedTokenRepository invalidatedTokenRepository;

   // 3 PHƯƠNG THỨC BÊN DƯỚI LÀ DÀNH CHO CHƯA CÓ VÀ CẦN TẠO RA TOKEN
   public Jwt generateAccessToken(User user) {
      return generateToken(user, jwtConfig.getAccessTokenExpiration());
   }

   public Jwt generateRefreshToken(User user) {
      return generateToken(user, jwtConfig.getRefreshTokenExpiration());
   }

   private Jwt generateToken(User user, long expirationTime) {
      var claims = Jwts.claims()
              .id(UUID.randomUUID().toString())   // jti – unique token ID dùng cho blacklist
              .subject(user.getId().toString())
              .add("email", user.getEmail())
              .add("name", user.getFullName())
              .add("role", user.getRole())
              .issuedAt(new Date())
              .expiration(new Date(System.currentTimeMillis() + 1000L * expirationTime))
              .build();

      return new Jwt(claims, jwtConfig.getSecretKey());
   }

   // DÀNH CHO ĐÃ CÓ TOKEN CẦN TẠO RA JWT ENTITY ĐỂ SỬ DỤNG
   public Jwt parseToken(String authToken) {
      try {
         var claims = getClaims(authToken);
         return new Jwt(claims, jwtConfig.getSecretKey());
      } catch (JwtException e) {
         return null;
      }
   }

   /**
    * Kiểm tra token có hợp lệ không (chưa hết hạn VÀ chưa bị blacklist).
    * Trả về true nếu HỢP LỆ, false nếu không hợp lệ.
    */
   public boolean isTokenValid(Jwt jwt) {
      if (jwt == null || jwt.isExpirated()) return false;
      String jti = jwt.getJtiFromToken();
      if (jti == null) return false;
      // Nếu jti có trong bảng invalidated_tokens → token đã bị logout
      return !invalidatedTokenRepository.existsById(jti);
   }

   private Claims getClaims(String authToken) {
      return Jwts.parser()
              .verifyWith(jwtConfig.getSecretKey())
              .build()
              .parseSignedClaims(authToken)
              .getPayload();
   }
}
