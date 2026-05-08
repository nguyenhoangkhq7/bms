package fit.iuh.report;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final JdbcTemplate jdbc;

    public ReportService(@org.springframework.beans.factory.annotation.Qualifier("orderJdbcTemplate") JdbcTemplate orderJdbcTemplate) {
        this.jdbc = orderJdbcTemplate;
    }

    public List<Map<String, Object>> revenueByPeriod(String period, LocalDate refDate) {
        // period: week, month, year
        List<Map<String, Object>> rows = new ArrayList<>();

        String dateTrunc = period; // expect 'week' | 'month' | 'year'

        java.time.LocalDate startDate;
        java.time.LocalDate endDate;
        if ("week".equals(period)) {
            startDate = refDate.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            endDate = startDate.plusDays(7);
        } else if ("month".equals(period)) {
            startDate = refDate.withDayOfMonth(1);
            endDate = startDate.plusMonths(1);
        } else { // year
            startDate = refDate.withDayOfYear(1);
            endDate = startDate.plusYears(1);
        }

        java.time.OffsetDateTime startOt = startDate.atStartOfDay().atOffset(java.time.ZoneOffset.UTC);
        java.time.OffsetDateTime endOt = endDate.atStartOfDay().atOffset(java.time.ZoneOffset.UTC);

        String sql = "SELECT date_trunc('" + dateTrunc + "', created_at) as bucket, COALESCE(SUM(total_amount),0) as revenue "
            + "FROM orders WHERE status = 'COMPLETED' AND created_at >= ? AND created_at < ? GROUP BY bucket ORDER BY bucket";

        jdbc.query(sql, new Object[]{startOt, endOt}, (ResultSet rs) -> {
            while (rs.next()) {
                rows.add(Map.of(
                    "bucket", rs.getObject("bucket"),
                    "revenue", rs.getBigDecimal("revenue")
                ));
            }
        });

        return rows;
    }
}
