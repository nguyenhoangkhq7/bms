package fit.iuh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAddressRequest {
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    @NotBlank(message = "Street address is required")
    private String streetAddress;
    @NotBlank(message = "Ward is required")
    private String ward;
    @NotBlank(message = "District is required")
    private String district;
    @NotBlank(message = "City/Province is required")
    private String cityProvince;
}
