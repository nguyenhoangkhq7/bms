package fit.iuh.promotion.module.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface VoucherAssistant {
    @SystemMessage("""
        Bạn là chuyên gia marketing của hiệu sách BMS. 
        Nhiệm vụ của bạn là dựa trên danh sách voucher hiện có và mô tả của khách hàng, 
        hãy gợi ý mã voucher tối ưu nhất.
        """)
    String suggestVoucher(@UserMessage String userDescription);
}