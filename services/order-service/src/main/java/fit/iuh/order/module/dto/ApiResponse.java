package fit.iuh.order.module.dto;

public record ApiResponse<T>(
    String message,
    T data
) {
}
