package fit.iuh.mapper;

import fit.iuh.dto.RegisterUserRequest;
import fit.iuh.dto.UpdateUserRequest;
import fit.iuh.dto.UserDto;
import fit.iuh.entity.User;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface UserMapper {
   UserDto toDto(User user);
   User toEntity(RegisterUserRequest request);
   void updateUser(UpdateUserRequest request, @MappingTarget User user);
}
