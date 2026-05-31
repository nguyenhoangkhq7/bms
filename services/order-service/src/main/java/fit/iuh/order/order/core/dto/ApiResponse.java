package fit.iuh.order.order.core.dto;

public record ApiResponse<T>(
    String message,
    T data
) {
}
