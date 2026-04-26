package fit.iuh.service;

import fit.iuh.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;

import javax.crypto.SecretKey;
import java.util.Date;

@AllArgsConstructor
public class Jwt {
   private final Claims claims;
   private final SecretKey secretKey;

   public boolean isExpirated() {
         return claims.getExpiration().before(new Date());
   }

   public Long getUserIdFromToken() {
      return Long.parseLong(claims.getSubject());
   }

   /** Lấy JWT ID (jti) – dùng làm khóa cho blacklist */
   public String getJtiFromToken() {
      return claims.getId();
   }

   /** Lấy thời điểm hết hạn của token */
   public java.util.Date getExpirationFromToken() {
      return claims.getExpiration();
   }

   public Role getRoleFromToken() {
      return Role.valueOf(claims.get("role").toString());
   }

   @Override
   public String toString() {
      return Jwts.builder()
              .claims(claims)
              .signWith(secretKey)
              .compact();
   }
}
