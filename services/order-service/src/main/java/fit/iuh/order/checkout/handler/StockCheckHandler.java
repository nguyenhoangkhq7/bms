package fit.iuh.order.checkout.handler;

import fit.iuh.order.checkout.model.CheckoutContext;
import fit.iuh.order.cart.repository.CartRedisRepository;
import fit.iuh.order.cart.model.RedisCart;
import fit.iuh.order.cart.model.RedisCartItem;
import fit.iuh.order.exception.BadRequestException;
import fit.iuh.order.exception.NotFoundException;
import fit.iuh.order.order.core.dto.OrderItemRequest;
import fit.iuh.order.order.core.dto.external.BookResponseDTO;
import fit.iuh.order.order.core.model.OrderItem;
import io.github.resilience4j.retry.annotation.Retry;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
@RequiredArgsConstructor
public class StockCheckHandler extends CheckoutHandler {
    private final CartRedisRepository cartRedisRepository;
    private final RestTemplate restTemplate;

    @Value("${external.product-service.base-url:http://product-service:8082}")
    private String productServiceBaseUrl;

    @Override
    @Retry(name = "backendCallRetry", fallbackMethod = "fallbackStockCheck")
    public void handle(CheckoutContext context) {
        log.info("Starting stock check execution for user: {}", context.getUserId());
        process(context);
        handleNext(context);
    }

    @Override
    protected void process(CheckoutContext context) {
        List<OrderItemRequest> requestedItems = context.getRequestedItems();
        List<OrderItemRequest> itemRequests = new ArrayList<>();

        if (requestedItems != null && !requestedItems.isEmpty()) {
            itemRequests.addAll(requestedItems);
        } else {
            RedisCart cart = cartRedisRepository.getCart(context.getUserId());
            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new BadRequestException("Cart is empty");
            }
            context.setCartId(cart.getUserId()); // Set cart ID to userId for identification
            for (RedisCartItem item : cart.getItems()) {
                itemRequests.add(new OrderItemRequest(item.getBookId(), item.getQuantity()));
            }
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            if (itemRequest.getQuantity() <= 0) {
                throw new BadRequestException(
                    "Quantity must be greater than 0 for bookId: " + itemRequest.getBookId()
                );
            }

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

    public void fallbackStockCheck(CheckoutContext context, Exception ex) {
        log.error("All retry attempts failed to call product-service in StockCheckHandler. Error: {}. Marking stock as failed but allowed to bypass.", ex.getMessage(), ex);
        context.setMetadata("STOCK_CHECK_STATUS", "FAILED_BUT_ALLOWED");
        handleNext(context);
    }
}
