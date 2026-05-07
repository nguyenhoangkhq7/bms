package fit.iuh.order.module.handler;

import fit.iuh.order.module.cart_management.repository.CartItemRepository;
import fit.iuh.order.module.cart_management.repository.CartRepository;
import fit.iuh.order.module.exception.BadRequestException;
import fit.iuh.order.module.exception.NotFoundException;
import fit.iuh.order.module.order_management.dto.OrderItemRequest;
import fit.iuh.order.module.order_management.dto.external.BookResponseDTO;
import fit.iuh.order.module.models.Cart;
import fit.iuh.order.module.models.CartItem;
import fit.iuh.order.module.models.OrderItem;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class StockCheckHandler extends CheckoutHandler {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RestTemplate restTemplate;

    @Value("${external.product-service.base-url:http://product-service:8082}")
    private String productServiceBaseUrl;

    @Override
    protected void process(CheckoutContext context) {
        List<OrderItemRequest> requestedItems = context.getRequestedItems();
        List<OrderItemRequest> itemRequests = new ArrayList<>();

        if (requestedItems != null && !requestedItems.isEmpty()) {
            itemRequests.addAll(requestedItems);
        } else {
            Cart cart = cartRepository.findByUserId(context.getUserId())
                .orElseThrow(() -> new NotFoundException("Cart not found for userId=" + context.getUserId()));
            context.setCartId(cart.getId());
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
            if (cartItems.isEmpty()) {
                throw new BadRequestException("Cart is empty");
            }
            for (CartItem item : cartItems) {
                itemRequests.add(new OrderItemRequest(item.getBookId(), item.getQuantity()));
            }
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            BookResponseDTO book = restTemplate.getForObject(
                productServiceBaseUrl + "/api/books/" + itemRequest.getBookId(),
                BookResponseDTO.class
            );

            if (book == null) {
                throw new NotFoundException("Book not found with id: " + itemRequest.getBookId());
            }
            if (book.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException(
                    "Insufficient stock for bookId: " + itemRequest.getBookId()
                );
            }

            OrderItem orderItem = OrderItem.builder()
                .bookId(itemRequest.getBookId())
                .quantity(itemRequest.getQuantity())
                .priceAtPurchase(book.getPrice())
                .build();
            orderItems.add(orderItem);

            BigDecimal lineTotal = book.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(lineTotal);
        }

        context.setOrderItems(orderItems);
        context.setSubtotal(subtotal);
    }
}
