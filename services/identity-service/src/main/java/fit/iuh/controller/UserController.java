package fit.iuh.controller;

import fit.iuh.dto.request.UpdateAddressRequest;
import fit.iuh.dto.request.UpdateProfileRequest;
import fit.iuh.dto.response.UserProfileResponse;
import fit.iuh.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    private Long getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        return (Long) authentication.getPrincipal();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<Void> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        userService.updateProfile(userId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile/address")
    public ResponseEntity<Void> updateAddress(@Valid @RequestBody UpdateAddressRequest request) {
        Long userId = getCurrentUserId();
        userService.updateAddress(userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<Void> updateAvatar(@RequestPart("file") MultipartFile file) {
        log.info("Received request to update avatar, file: {}", file.getOriginalFilename());
        Long userId = getCurrentUserId();
        userService.updateAvatar(userId, file);
        return ResponseEntity.ok().build();
    }
}
