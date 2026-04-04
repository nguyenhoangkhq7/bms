package fit.iuh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@AllArgsConstructor
@Getter
@ToString
public class UserDto {
   private Long id;
    private String fullName;
    private String email;
}
