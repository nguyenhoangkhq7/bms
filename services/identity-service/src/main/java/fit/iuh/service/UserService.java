package fit.iuh.service;

import fit.iuh.entity.User;
import fit.iuh.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
   private final UserRepository userRepository;
   @Override
   public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
      User user = userRepository.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
      return new org.springframework.security.core.userdetails.User(
              user.getUsername(),
              user.getPassword(),
              Collections.emptyList()
      );
   }
}
