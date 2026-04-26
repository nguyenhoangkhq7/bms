package fit.iuh.mapper;

import fit.iuh.dto.request.RegisterUserRequest;
import fit.iuh.dto.request.UpdateUserRequest;
import fit.iuh.dto.response.UserDto;
import fit.iuh.entity.User;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    builder = @Builder(disableBuilder = true),
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
   UserDto toDto(User user);

   @Mapping(source = "name", target = "fullName")
   User toEntity(RegisterUserRequest request);

   @Mapping(source = "name", target = "fullName")
   void updateUser(UpdateUserRequest request, @MappingTarget User user);
}
