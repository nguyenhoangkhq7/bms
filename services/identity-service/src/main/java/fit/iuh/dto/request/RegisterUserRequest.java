package fit.iuh.dto.request;

import fit.iuh.validate.Lowercase;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class RegisterUserRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 255, message = "Username must be between 3 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, hyphens, and underscores")
    private String username;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name can't be longer than 255 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    @Lowercase(message = "Email must be lowercase")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // --- Thông tin Address ---
    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number can't be longer than 20 characters")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Phone number is invalid (Must be a valid Vietnamese phone number)")
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    private String streetAddress;

    @NotBlank(message = "Ward is required")
    @Size(max = 100, message = "Ward can't be longer than 100 characters")
    private String ward;

    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District can't be longer than 100 characters")
    private String district;

    @NotBlank(message = "City/Province is required")
    @Size(max = 100, message = "City/Province can't be longer than 100 characters")
    private String cityProvince;
}
