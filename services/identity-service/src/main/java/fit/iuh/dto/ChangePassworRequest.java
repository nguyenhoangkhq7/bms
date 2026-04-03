package fit.iuh.dto;

import lombok.Data;

@Data
public class ChangePassworRequest {
   private String oldPassword;
   private String newPassword;

}
