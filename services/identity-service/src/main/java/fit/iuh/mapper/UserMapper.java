package fit.iuh.mapper;

import fit.iuh.dto.request.RegisterUserRequest;
import fit.iuh.dto.request.UpdateUserRequest;
import fit.iuh.dto.response.UserDto;
import fit.iuh.entity.User;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface UserMapper {
   UserDto toDto(User user);

   @Mapping(source = "name", target = "fullName")
   User toEntity(RegisterUserRequest request);
   void updateUser(UpdateUserRequest request, @MappingTarget User user);
}
