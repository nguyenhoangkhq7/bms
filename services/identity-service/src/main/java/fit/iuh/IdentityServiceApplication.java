package fit.iuh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class IdentityServiceApplication {

   public static void main(String[] args) {
      TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
      SpringApplication.run(IdentityServiceApplication.class, args);
   }

}
