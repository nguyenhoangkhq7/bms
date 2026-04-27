package fit.iuh.service;

import fit.iuh.dto.request.UpdateAddressRequest;
import fit.iuh.dto.request.UpdateProfileRequest;
import fit.iuh.dto.response.UserProfileResponse;
import fit.iuh.entity.Address;
import fit.iuh.entity.User;
import fit.iuh.repository.AddressRepository;
import fit.iuh.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final S3Service s3Service;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.emptyList()
        );
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Address address = addressRepository.findTopByUserIdOrderByIdAsc(userId).orElse(null);
        
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .avatarUrl(user.getAvatarUrl());

        if (address != null) {
            builder.phoneNumber(address.getPhoneNumber())
                    .streetAddress(address.getStreetAddress())
                    .ward(address.getWard())
                    .district(address.getDistrict())
                    .cityProvince(address.getCityProvince());
        }

        return builder.build();
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.setFullName(request.getFullName());
        user.setDateOfBirth(request.getDateOfBirth());
        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public UserProfileResponse updateAddress(Long userId, UpdateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Address address = addressRepository.findTopByUserIdOrderByIdAsc(userId).orElse(new Address());
        if (address.getUser() == null) {
            address.setUser(user);
        }
        
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreetAddress(request.getStreetAddress());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setCityProvince(request.getCityProvince());
        
        addressRepository.save(address);
        return getProfile(userId);
    }

    @Transactional
    public UserProfileResponse updateAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }
        
        // 1. Xóa ảnh cũ nếu có
        if (user.getAvatarUrl() != null) {
            s3Service.deleteFile(user.getAvatarUrl());
        }

        // 2. Tải ảnh mới lên
        String avatarUrl = s3Service.uploadFile(file, "avatars");
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public UserProfileResponse removeAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getAvatarUrl() != null) {
            s3Service.deleteFile(user.getAvatarUrl());
            user.setAvatarUrl(null);
            userRepository.save(user);
        }

        return getProfile(userId);
    }
}
