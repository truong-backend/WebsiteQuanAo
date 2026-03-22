package com.example.Server.service;

import com.example.Server.dto.request.payment.PaymentCreateRequest;
import com.example.Server.dto.request.payment.PaymentUpdateRequest;
import com.example.Server.dto.request.payment.MomoCreatePaymentRequest;
import com.example.Server.dto.request.payment.VnpayCreatePaymentRequest;
import com.example.Server.dto.response.payment.MomoCreatePaymentResponse;
import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.dto.response.payment.VnpayCreatePaymentResponse;
import com.example.Server.entity.Order;
import com.example.Server.entity.Payment;
import com.example.Server.enums.OrderStatus;
import com.example.Server.enums.PaymentType;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.PaymentMapper;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

/**
 * Service xử lý toàn bộ business logic liên quan đến Payment,
 * bao gồm CRUD, tích hợp VNPAY và MoMo.
 */
@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final VnpayService vnpayService;
    private final MomoService momoService;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            VnpayService vnpayService,
            MomoService momoService
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.vnpayService = vnpayService;
        this.momoService = momoService;
    }

    // ─────────────────────────── CRUD ───────────────────────────

    /**
     * Lấy danh sách payment có phân trang và tìm kiếm theo id hoặc type.
     *
     * @param pageable thông tin phân trang
     * @param search   từ khóa tìm kiếm (id hoặc type)
     * @return trang kết quả PaymentResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<PaymentResponse> findAll(Pageable pageable, String search) {
        Specification<Payment> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id").as(String.class)), keyword),
                            cb.like(cb.lower(root.get("type").as(String.class)), keyword)
                    )
            );
        }

        return paymentRepository.findAll(spec, pageable).map(PaymentMapper::toResponse);
    }

    /**
     * Tạo mới một Payment.
     *
     * @param request dữ liệu tạo payment
     * @return PaymentResponse vừa tạo
     */
    public PaymentResponse create(PaymentCreateRequest request) {
        String paymentId = normalizeId(request.getId());

        if (paymentRepository.existsById(paymentId)) {
            throw new ResourceAlreadyExistsException("Payment", "id", paymentId);
        }

        Payment payment = new Payment();
        payment.setId(paymentId);
        payment.setType(request.getType());
        payment.setPayTime(request.getPayTime());

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    /**
     * Cập nhật Payment theo id.
     *
     * @param id      id của payment
     * @param request dữ liệu cập nhật
     * @return PaymentResponse đã cập nhật
     */
    public PaymentResponse update(String id, PaymentUpdateRequest request) {
        Payment payment = findPaymentById(id);
        payment.setType(request.getType());
        payment.setPayTime(request.getPayTime());
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    /**
     * Xóa Payment theo id.
     * Không cho xóa nếu payment đang gắn với một Order.
     *
     * @param id id của payment
     */
    public void delete(String id) {
        Payment payment = findPaymentById(id);

        if (payment.getOrder() != null) {
            throw new InvalidOperationException(
                    "Cannot delete payment that is associated with an order. " +
                    "Please remove or reassign the order first."
            );
        }

        paymentRepository.delete(payment);
    }

    /**
     * Lấy Payment theo id.
     *
     * @param id id của payment
     * @return PaymentResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public PaymentResponse getById(String id) {
        return PaymentMapper.toResponse(findPaymentById(id));
    }

    // ─────────────────────────── VNPAY ───────────────────────────

    /**
     * Tạo URL thanh toán VNPAY cho một đơn hàng.
     *
     * @param request   chứa orderId và amount
     * @param httpRequest HTTP request để lấy client IP
     * @return VnpayCreatePaymentResponse chứa payUrl
     */
    public VnpayCreatePaymentResponse createVnpayPaymentUrl(
            VnpayCreatePaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        Order order = findOrderById(request.getOrderId());
        String clientIp = vnpayService.getClientIp(httpRequest);
        String payUrl = vnpayService.createPaymentUrl(order.getId(), request.getAmount(), clientIp);
        return new VnpayCreatePaymentResponse(payUrl);
    }

    /**
     * Xử lý IPN callback từ VNPAY.
     * Verify chữ ký, cập nhật trạng thái đơn hàng và payment.
     *
     * @param params các tham số VNPAY gửi về
     * @return thông báo kết quả xử lý
     */
    public String handleVnpayIpn(Map<String, String> params) {
        if (!vnpayService.validateSignature(params)) {
            return "INVALID_SIGNATURE";
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        if (txnRef == null || txnRef.isBlank()) {
            return "MISSING_ORDER";
        }

        Order order = orderRepository.findById(txnRef).orElse(null);
        if (order == null) {
            return "ORDER_NOT_FOUND";
        }

        if ("00".equals(responseCode)) {
            updateOrCreatePayment(order, PaymentType.VNPAY,
                    params.getOrDefault("vnp_TransactionNo", "VNPAY-" + txnRef));
            order.setStatus(OrderStatus.COMPLETED);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
        return "00".equals(responseCode) ? "OK" : "CANCELLED";
    }

    // ─────────────────────────── MOMO ───────────────────────────

    /**
     * Tạo URL thanh toán MoMo cho một đơn hàng.
     *
     * @param request chứa orderId và amount
     * @return MomoCreatePaymentResponse chứa payUrl
     */
    public MomoCreatePaymentResponse createMomoPaymentUrl(MomoCreatePaymentRequest request) {
        Order order = findOrderById(request.getOrderId());
        String payUrl = momoService.createPaymentUrl(order.getId(), request.getAmount());
        return new MomoCreatePaymentResponse(payUrl);
    }

    /**
     * Xử lý IPN callback từ MoMo (POST JSON body đã được parse).
     * Cập nhật trạng thái đơn hàng và payment.
     *
     * @param orderId    mã đơn hàng
     * @param resultCode kết quả từ MoMo (0 = thành công)
     * @param transId    mã giao dịch MoMo
     * @return resultCode phản hồi cho MoMo
     */
    public int handleMomoIpn(String orderId, int resultCode, String transId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return 97;
        }

        if (resultCode == 0) {
            String paymentId = transId != null ? transId : "MOMO-" + orderId;
            updateOrCreatePayment(order, PaymentType.MOMO, paymentId);
            order.setStatus(OrderStatus.COMPLETED);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
        return 0;
    }

    // ─────────────────────────── HELPERS ───────────────────────────

    /**
     * Cập nhật payment hiện có hoặc tạo mới nếu đơn hàng chưa có payment.
     */
    private void updateOrCreatePayment(Order order, PaymentType type, String paymentId) {
        Payment payment = order.getPayment();
        if (payment == null) {
            payment = new Payment();
            payment.setId(paymentId);
            payment.setType(type);
            payment.setPayTime(Instant.now());
            paymentRepository.save(payment);
            order.setPayment(payment);
        } else {
            payment.setType(type);
            payment.setPayTime(Instant.now());
            paymentRepository.save(payment);
        }
    }

    private Payment findPaymentById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    private Order findOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private String normalizeId(String id) {
        return id == null ? null : id.trim();
    }
}
