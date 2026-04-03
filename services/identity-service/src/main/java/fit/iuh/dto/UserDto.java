package fit.iuh.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@AllArgsConstructor
@Getter
@ToString
public class UserDto {
   private Long id;
   private String name;
   private String email;
}
