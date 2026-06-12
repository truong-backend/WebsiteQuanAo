package com.example.fashionstore.controller.chat;

import com.example.fashionstore.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatModel chatModel;

    // Mỗi sessionId có 1 ChatMemory riêng — lưu tối đa 20 tin nhắn gần nhất
    private final Map<String, ChatClient> clientMap = new ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý tư vấn thời trang của cửa hàng LUXE — một shop quần áo cao cấp.
            Nhiệm vụ của bạn:
            - Tư vấn về phong cách thời trang, cách phối đồ, chọn size, chọn màu sắc phù hợp.
            - Hỗ trợ khách hàng tìm sản phẩm phù hợp với nhu cầu.
            - Giải đáp thắc mắc về chính sách đổi trả, vận chuyển, thanh toán của cửa hàng.
            - Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
            - Nếu câu hỏi không liên quan đến thời trang hoặc cửa hàng, hãy lịch sự từ chối và hướng về chủ đề chính.
            Chính sách cửa hàng:
            - Miễn phí vận chuyển cho đơn hàng trên 500.000đ.
            - Đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem nhãn.
            - Thanh toán: COD hoặc VNPay.
            """;

    @PostMapping
    public ApiResponse<String> chat(
            @RequestParam(defaultValue = "default") String sessionId,
            @RequestBody ChatRequest request
    ) {
        ChatClient client = clientMap.computeIfAbsent(sessionId, id -> {
            ChatMemory memory = MessageWindowChatMemory.builder().maxMessages(20).build();
            return ChatClient.builder(chatModel)
                    .defaultSystem(SYSTEM_PROMPT)
                    .defaultAdvisors(MessageChatMemoryAdvisor.builder(memory).build())
                    .build();
        });

        String reply = client.prompt()
                .user(request.message())
                .call()
                .content();

        return ApiResponse.<String>builder()
                .success(true)
                .message("OK")
                .data(reply)
                .build();
    }

    // Xoá memory khi user kết thúc phiên
    @DeleteMapping("/{sessionId}")
    public ApiResponse<Void> clearSession(@PathVariable String sessionId) {
        clientMap.remove(sessionId);
        return ApiResponse.<Void>builder().success(true).message("Đã xoá phiên chat").build();
    }

    public record ChatRequest(String message) {}
}