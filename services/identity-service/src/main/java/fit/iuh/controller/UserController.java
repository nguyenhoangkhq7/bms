package fit.iuh.controller;

import fit.iuh.dto.request.ChangePasswordRequest;
import fit.iuh.dto.request.RegisterUserRequest;
import fit.iuh.dto.request.UpdateUserRequest;
import fit.iuh.dto.response.UserDto;
import fit.iuh.entity.Role;
import fit.iuh.entity.User;
import fit.iuh.repository.UserRepository;
import fit.iuh.mapper.UserMapper;
import fit.iuh.service.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {
   private final UserRepository userRepository;
   private final UserMapper userMapper;
   private final PasswordEncoder passwordEncoder;
   private final AuthService authService;

   @PostMapping
   public ResponseEntity<?> registerUser(
           @Valid @RequestBody RegisterUserRequest request,
           UriComponentsBuilder uriBuilder
   ) {
      if(userRepository.existsByEmail(request.getEmail())) {
         return ResponseEntity.badRequest().body(
                 Map.of("err", "Email is already registered")
         );
      }

      User user = userMapper.toEntity(request);
      user.setPassword(passwordEncoder.encode(user.getPassword()));
      user.setRole(Role.CUSTOMER);
      userRepository.save(user);
      UserDto userDto = userMapper.toDto(user);
      URI uri = uriBuilder.path("/users/{id}").buildAndExpand(user.getId()).toUri();
      return ResponseEntity.created(uri).body(userDto);
   }

   @GetMapping
   public List<UserDto> getAllUser(
           @RequestParam(required = false, defaultValue = "", name = "sortBy") String sortBy
   ) {
      if(!Set.of("name", "email").contains(sortBy))
         sortBy = "name";

      return userRepository.findAll(Sort.by(sortBy).descending()).stream()
              .map(userMapper::toDto)
              .toList();
   }

   @GetMapping("/{id}")
   public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
      User user = userRepository.findById(id).orElse(null);
      if(user!=null) return ResponseEntity.ok(userMapper.toDto(user));
      return ResponseEntity.notFound().build();
   }

   @PutMapping("/{id}")
   public ResponseEntity<UserDto> updateUser(
      @PathVariable Long id,
      @RequestBody UpdateUserRequest request
   ) {
      System.out.println(request);
      User user = userRepository.findById(id).orElse(null);
      if(user==null) return ResponseEntity.notFound().build();
      userMapper.updateUser(request, user);
      System.out.println(user);
      userRepository.save(user);
      return ResponseEntity.ok(userMapper.toDto(user));
   }


   @DeleteMapping("/{id}")
   public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
      User user = userRepository.findById(id).orElse(null);
      if(user==null) return ResponseEntity.notFound().build();
      userRepository.delete(user);
      return ResponseEntity.noContent().build();
   }

   @PutMapping("/password")
   public ResponseEntity<Void> changePassword(
      @Valid @RequestBody ChangePasswordRequest request
   ) {
      authService.changePassword(request);
      return ResponseEntity.noContent().build();
   }
}
