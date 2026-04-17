package fit.iuh.order.module.controller;

import fit.iuh.order.module.config.WebMvcConfig;
import fit.iuh.order.module.dto.CartResponse;
import fit.iuh.order.module.ratelimit.CartRateLimitInterceptor;
import fit.iuh.order.module.ratelimit.CartRateLimiter;
import fit.iuh.order.module.ratelimit.RequestBodyCacheFilter;
import fit.iuh.order.module.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CartController.class)
@Import({WebMvcConfig.class, CartRateLimitInterceptor.class, CartRateLimiter.class, RequestBodyCacheFilter.class})
class CartRateLimitIntegrationTest {
    private static final String TOO_MANY_REQUESTS_MESSAGE = "Bạn thao tác quá nhanh, vui lòng đợi một lát.";
    private static final String REQUEST_BODY = """
        {
          "userId": 10,
          "bookId": 100,
          "quantity": 1
        }
        """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CartRateLimiter cartRateLimiter;

    @MockitoBean
    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartRateLimiter.clear();
        when(cartService.addProduct(any())).thenReturn(new CartResponse(1L, 10L, BigDecimal.ZERO, List.of()));
    }

    @Test
    void addProduct_shouldReturn429OnTwentyFirstRequestWithinOneMinute() throws Exception {
        for (int i = 0; i < 20; i++) {
            mockMvc.perform(post("/cart/items/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(REQUEST_BODY))
                .andExpect(status().isOk());
        }

        mockMvc.perform(post("/cart/items/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(REQUEST_BODY))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.message").value(TOO_MANY_REQUESTS_MESSAGE));

        verify(cartService, times(20)).addProduct(any());
    }
}