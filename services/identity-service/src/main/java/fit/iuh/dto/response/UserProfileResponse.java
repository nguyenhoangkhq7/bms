package fit.iuh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private String avatarUrl;
    
    // Address info
    private String phoneNumber;
    private String streetAddress;
    private String ward;
    private String district;
    private String cityProvince;
}
