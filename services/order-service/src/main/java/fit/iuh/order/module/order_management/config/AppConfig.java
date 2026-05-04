package fit.iuh.order.module.order_management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration("orderManagementAppConfig")
public class AppConfig {
    @Bean("orderManagementRestTemplate")
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
