package fit.iuh.report;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class OrderDbConfig {

    @Value("${ORDER_DB_URL:jdbc:postgresql://postgres:5432/order_db}")
    private String url;

    @Value("${ORDER_DB_USER:order_db}")
    private String username;

    @Value("${ORDER_DB_PASSWORD:order_db}")
    private String password;

    @Bean(name = "orderDataSource")
    public DataSource orderDataSource() {
        return DataSourceBuilder.create()
            .url(url)
            .username(username)
            .password(password)
            .build();
    }

    @Bean(name = "orderJdbcTemplate")
    public JdbcTemplate orderJdbcTemplate(DataSource orderDataSource) {
        return new JdbcTemplate(orderDataSource);
    }
}
