package fit.iuh.order.module.order_management.service;

import fit.iuh.order.module.order_management.dto.*;
import fit.iuh.order.module.order_management.dto.external.BookResponseDTO;
import fit.iuh.order.module.models.Order;
import fit.iuh.order.module.models.OrderItem;
import fit.iuh.order.module.models.enums.OrderStatus;
import fit.iuh.order.module.order_management.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("orderManagementOrderService")
public class OrderService {
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    public OrderService(OrderRepository orderRepository, @Qualifier("orderManagementRestTemplate") RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    private final String PRODUCT_SERVICE_URL = "http://product-service:8082/api/books/";

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = Order.builder()
                .userId(request.getUserId())
                .orderCode("ORD-" + System.currentTimeMillis()) // Simple generation
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .shippingAddress(request.getShippingAddress())
                .shippingLatitude(request.getShippingLatitude())
                .shippingLongitude(request.getShippingLongitude())
                .build();

        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            // Confirm stock and price with product-service
            BookResponseDTO book = restTemplate.getForObject(PRODUCT_SERVICE_URL + itemRequest.getBookId(), BookResponseDTO.class);
            
            if (book == null) {
                throw new RuntimeException("Book not found with id: " + itemRequest.getBookId());
            }
            if (book.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for bookId: " + itemRequest.getBookId() + ". Available: " + book.getStockQuantity());
            }

            return OrderItem.builder()
                    .order(order)
                    .bookId(itemRequest.getBookId())
                    .quantity(itemRequest.getQuantity())
                    .priceAtPurchase(book.getPrice())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .bookId(item.getBookId())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
