package fit.iuh.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fit.iuh.dto.DailySalesProjection;
import fit.iuh.dto.WeeklySalesProjection;
import fit.iuh.dto.MonthlySalesProjection;
import fit.iuh.dto.QuarterlySalesProjection;
import fit.iuh.dto.YearlySalesProjection;
import fit.iuh.dto.SalesSummaryResponse;
import fit.iuh.dto.TopBookProjection;
import fit.iuh.model.ReportOrder;
import fit.iuh.model.ReportOrderItem;
import fit.iuh.repository.ReportOrderItemRepository;
import fit.iuh.repository.ReportOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportOrderRepository reportOrderRepository;
    private final ReportOrderItemRepository reportOrderItemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Value("${app.order-service-url:http://order-service:8083}")
    private String orderServiceUrl;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return Map.of(
            "service", "report-service",
            "status", "READY",
            "generatedAt", Instant.now().toString(),
            "message", "Report service is reachable from admin"
        );
    }

    @GetMapping("/sales-summary")
    public SalesSummaryResponse getSalesSummary() {
        BigDecimal totalRevenue = reportOrderRepository.sumFinalTotal();
        Long totalOrders = reportOrderRepository.count();
        Long totalBooksSold = reportOrderRepository.sumTotalBooksSold();

        return new SalesSummaryResponse(
            totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
            totalOrders != null ? totalOrders : 0L,
            totalBooksSold != null ? totalBooksSold : 0L
        );
    }

    @GetMapping("/daily-sales")
    public List<DailySalesProjection> getDailySales() {
        // Lấy báo cáo 7 ngày gần nhất (từ 00:00:00 của 7 ngày trước)
        LocalDateTime startDate = LocalDateTime.now().minusDays(7).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportOrderRepository.getDailySales(startDate);
    }

    @GetMapping("/weekly-sales")
    public List<WeeklySalesProjection> getWeeklySales() {
        // Lấy báo cáo 8 tuần gần nhất
        LocalDateTime startDate = LocalDateTime.now().minusWeeks(8).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportOrderRepository.getWeeklySales(startDate);
    }

    @GetMapping("/monthly-sales")
    public List<MonthlySalesProjection> getMonthlySales() {
        // Lấy báo cáo 12 tháng gần nhất
        LocalDateTime startDate = LocalDateTime.now().minusMonths(12).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportOrderRepository.getMonthlySales(startDate);
    }

    @GetMapping("/quarterly-sales")
    public List<QuarterlySalesProjection> getQuarterlySales() {
        // Lấy báo cáo 8 quý gần nhất (2 năm)
        LocalDateTime startDate = LocalDateTime.now().minusMonths(24).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return reportOrderRepository.getQuarterlySales(startDate);
    }

    @GetMapping("/yearly-sales")
    public List<YearlySalesProjection> getYearlySales() {
        return reportOrderRepository.getYearlySales();
    }

    @GetMapping("/top-books")
    public List<TopBookProjection> getTopSellingBooks(@RequestParam(value = "limit", defaultValue = "5") int limit) {
        return reportOrderItemRepository.getTopSellingBooks(limit);
    }

    @PostMapping("/sync")
    public Map<String, Object> syncOrders() {
        try {
            log.info("Starting synchronization of completed orders from order-service. Base URL: {}", orderServiceUrl);
            
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(orderServiceUrl + "/api/orders"))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                log.error("Failed to fetch orders from order-service: HTTP status {}", response.statusCode());
                return Map.of(
                    "status", "FAILED",
                    "message", "Failed to fetch orders from order-service. HTTP status: " + response.statusCode()
                );
            }
            
            String json = response.body();
            List<Map<String, Object>> orders = objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
            
            int totalProcessed = 0;
            int totalSynced = 0;
            
            for (Map<String, Object> orderMap : orders) {
                String status = (String) orderMap.get("status");
                if ("COMPLETED".equalsIgnoreCase(status)) {
                    totalProcessed++;
                    
                    Object idObj = orderMap.get("id");
                    Long orderId = idObj instanceof Number ? ((Number) idObj).longValue() : Long.valueOf(idObj.toString());
                    
                    if (reportOrderRepository.existsById(orderId)) {
                        log.debug("Order ID #{} already exists in reports database, skipping.", orderId);
                        continue;
                    }
                    
                    Object userIdObj = orderMap.get("userId");
                    Long userId = userIdObj instanceof Number ? ((Number) userIdObj).longValue() : Long.valueOf(userIdObj.toString());
                    
                    Object totalAmountObj = orderMap.get("totalAmount");
                    BigDecimal totalAmount = totalAmountObj != null ? new BigDecimal(totalAmountObj.toString()) : BigDecimal.ZERO;
                    
                    Object finalTotalObj = orderMap.get("finalTotal");
                    BigDecimal finalTotal = finalTotalObj != null ? new BigDecimal(finalTotalObj.toString()) : BigDecimal.ZERO;
                    
                    LocalDateTime completedAt = LocalDateTime.now();
                    Object orderDateObj = orderMap.get("orderDate");
                    if (orderDateObj != null) {
                        try {
                            completedAt = LocalDateTime.parse(orderDateObj.toString());
                        } catch (Exception e) {
                            log.warn("Failed to parse orderDate '{}' for Order ID #{}, falling back to now.", orderDateObj, orderId, e);
                        }
                    }
                    
                    ReportOrder reportOrder = ReportOrder.builder()
                            .orderId(orderId)
                            .userId(userId)
                            .totalAmount(totalAmount)
                            .finalTotal(finalTotal)
                            .completedAt(completedAt)
                            .build();
                    
                    List<Map<String, Object>> itemsList = (List<Map<String, Object>>) orderMap.get("items");
                    List<ReportOrderItem> items = new java.util.ArrayList<>();
                    if (itemsList != null) {
                        for (Map<String, Object> itemMap : itemsList) {
                            Object bookIdObj = itemMap.get("bookId");
                            Long bookId = bookIdObj instanceof Number ? ((Number) bookIdObj).longValue() : Long.valueOf(bookIdObj.toString());
                            
                            Object qtyObj = itemMap.get("quantity");
                            Integer quantity = qtyObj instanceof Number ? ((Number) qtyObj).intValue() : Integer.valueOf(qtyObj.toString());
                            
                            Object priceObj = itemMap.get("priceAtPurchase");
                            BigDecimal priceAtPurchase = priceObj != null ? new BigDecimal(priceObj.toString()) : BigDecimal.ZERO;
                            
                            items.add(ReportOrderItem.builder()
                                    .reportOrder(reportOrder)
                                    .bookId(bookId)
                                    .quantity(quantity)
                                    .priceAtPurchase(priceAtPurchase)
                                    .build());
                        }
                    }
                    
                    reportOrder.setItems(items);
                    reportOrderRepository.save(reportOrder);
                    totalSynced++;
                }
            }
            
            log.info("Synchronization complete. Total COMPLETED orders: {}, Synced to report_db: {}", totalProcessed, totalSynced);
            return Map.of(
                "status", "SUCCESS",
                "totalCompletedOrders", totalProcessed,
                "syncedOrders", totalSynced,
                "message", "Successfully synced " + totalSynced + " completed orders from order-service."
            );
            
        } catch (Exception e) {
            log.error("Error during order synchronization", e);
            return Map.of(
                "status", "ERROR",
                "message", "Error during order synchronization: " + e.getMessage()
            );
        }
    }
}
