package fit.iuh.service;

import fit.iuh.entity.User;
import fit.iuh.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {
   private final UserRepository userRepository;

   public User getCurrentUser() {
      var authentication = SecurityContextHolder.getContext().getAuthentication();
       assert authentication != null;
       var userId = (Long) authentication.getPrincipal();

       assert userId != null;
       return userRepository.findById(userId).orElseThrow();
   }
}
