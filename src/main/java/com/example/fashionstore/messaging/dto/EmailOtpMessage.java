package com.example.fashionstore.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Message gửi lên queue để EmailConsumer xử lý gửi OTP.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailOtpMessage implements Serializable {

    private String to;
    private String otp;

    /** "VERIFY" | "RESET_PASSWORD" */
    private String type;
}
