package fit.iuh.controller;

import fit.iuh.config.JwtConfig;
import fit.iuh.dto.response.JwtReponse;
import fit.iuh.dto.response.UserDto;
import fit.iuh.mapper.UserMapper;
import fit.iuh.repository.UserRepository;
import fit.iuh.service.AuthService;
import fit.iuh.service.JwtService;
import fit.iuh.dto.request.LoginRequest;
import fit.iuh.dto.request.RegisterUserRequest;
import fit.iuh.entity.Address;
import fit.iuh.entity.Role;
import fit.iuh.entity.User;
import fit.iuh.repository.AddressRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {
   private final AuthenticationManager manager;
   private final JwtService jwtService;
   private final AuthService authService;
   private final UserRepository userRepository;
   private final JwtConfig jwtConfig;
   private final UserMapper userMapper;
   private final AddressRepository addressRepository;
   private final PasswordEncoder passwordEncoder;

   @GetMapping("/me")
   public ResponseEntity<UserDto> me() {
      var authentication = SecurityContextHolder.getContext().getAuthentication();
       assert authentication != null;
       var userId = (Long) authentication.getPrincipal();

       assert userId != null;
       var user = userRepository.findById(userId).orElseThrow();

      return ResponseEntity.ok(userMapper.toDto(user));
   }



   @PostMapping("/login")
   public ResponseEntity<JwtReponse> login(
          @RequestBody LoginRequest request,
          HttpServletResponse response
   ) {
      manager.authenticate(new UsernamePasswordAuthenticationToken(
              request.getUsername(),
              request.getPassword()
      ));

      var user = userRepository.findUserByUsername(request.getUsername()).orElseThrow();

      String accessToken = jwtService.generateAccessToken(user).toString();
      String refreshToken = jwtService.generateRefreshToken(user).toString();

      var cookie = new Cookie("refreshToken", refreshToken);
      cookie.setHttpOnly(true);
      cookie.setPath("/auth/refresh");
      cookie.setMaxAge(jwtConfig.getRefreshTokenExpiration());
      cookie.setSecure(true);
      response.addCookie(cookie);
      return ResponseEntity.ok(new JwtReponse(accessToken));
   }

   @PostMapping("/register")
   public ResponseEntity<?> register(
           @Valid @RequestBody RegisterUserRequest request,
           HttpServletResponse response
   ) {
      if (userRepository.existsByEmail(request.getEmail())) {
         return ResponseEntity.badRequest().body("Email already exists");
      }
      if (userRepository.findUserByUsername(request.getUsername()).isPresent()) {
         return ResponseEntity.badRequest().body("Username already exists");
      }
      User user = userMapper.toEntity(request);
      user.setPassword(passwordEncoder.encode(request.getPassword()));
      user.setRole(Role.CUSTOMER);
      user.setStatus("ACTIVE");
      user.setFullName(request.getName());

      User savedUser = userRepository.save(user);

      Address address = new Address();
      address.setUser(savedUser);
      address.setPhoneNumber(request.getPhoneNumber());
      address.setStreetAddress(request.getStreetAddress());
      address.setWard(request.getWard());
      address.setDistrict(request.getDistrict());
      address.setCityProvince(request.getCityProvince());
      addressRepository.save(address);

      String accessToken = jwtService.generateAccessToken(savedUser).toString();
      String refreshToken = jwtService.generateRefreshToken(savedUser).toString();

      Cookie cookie = new Cookie("refreshToken", refreshToken);
      cookie.setHttpOnly(true);
      cookie.setPath("/auth/refresh");
      cookie.setMaxAge(jwtConfig.getRefreshTokenExpiration());
      cookie.setSecure(true);
      response.addCookie(cookie);

      return ResponseEntity.ok(new JwtReponse(accessToken));
   }

   @PostMapping("/refresh")
   public ResponseEntity<JwtReponse> refresh(
           @CookieValue(name = "refreshToken") String token
   ) {
      var jwt = jwtService.parseToken(token);
      if(jwt.isExpirated()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }

      Long id = jwt.getUserIdFromToken();
      var user = userRepository.findById(id).orElseThrow();

      String accessToken = jwtService.generateAccessToken(user).toString();

      return ResponseEntity.ok(new JwtReponse(accessToken));
   }

   @PostMapping("/logout")
   public ResponseEntity<Void> logout(
           HttpServletRequest request,
           HttpServletResponse response
   ) {
      // 1. Blacklist access token hiện tại
      String authHeader = request.getHeader("Authorization");
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
         String rawToken = authHeader.replace("Bearer ", "");
         authService.logout(rawToken);
      }

      // 2. Xóa refresh token cookie
      Cookie cookie = new Cookie("refreshToken", null);
      cookie.setHttpOnly(true);
      cookie.setPath("/auth/refresh");
      cookie.setMaxAge(0);
      cookie.setSecure(true);
      response.addCookie(cookie);

      return ResponseEntity.ok().build();
   }

   @ExceptionHandler(BadCredentialsException.class)
   public ResponseEntity<Void> handleBadCredentialsException () {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
   }
}
