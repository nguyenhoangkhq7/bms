package fit.iuh.dto.request;

import lombok.Data;

@Data
public class ChangePassworRequest {
   private String oldPassword;
   private String newPassword;

}
