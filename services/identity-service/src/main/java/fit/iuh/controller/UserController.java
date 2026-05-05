package fit.iuh.controller;

import fit.iuh.dto.request.UpdateAddressRequest;
import fit.iuh.dto.request.UpdateProfileRequest;
import fit.iuh.dto.response.UserProfileResponse;
import fit.iuh.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    private Long getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return (Long) authentication.getPrincipal();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/profile/address")
    public ResponseEntity<UserProfileResponse> updateAddress(@Valid @RequestBody UpdateAddressRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.updateAddress(userId, request));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<UserProfileResponse> updateAvatar(@RequestPart("file") MultipartFile file) {
        log.info("Received request to update avatar, file: {}", file.getOriginalFilename());
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.updateAvatar(userId, file));
    }

    @DeleteMapping("/profile/avatar")
    public ResponseEntity<UserProfileResponse> removeAvatar() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.removeAvatar(userId));
    }
}
