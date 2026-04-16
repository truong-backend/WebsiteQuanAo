package com.example.fashionstore;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ServerApplication {

	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		// ================= DATABASE =================
		setIfPresent(dotenv, "DB_URL", "spring.datasource.url");
		setIfPresent(dotenv, "DB_USERNAME", "spring.datasource.username");
		setIfPresent(dotenv, "DB_PASSWORD", "spring.datasource.password");

		// ================= JWT =================
		setIfPresent(dotenv, "JWT_SECRET", "security.jwt.secret-key");
		setIfPresent(dotenv, "JWT_EXPIRATION", "security.jwt.expiration-time");
		setIfPresent(dotenv, "JWT_REFRESH_EXPIRATION", "security.jwt.refresh-expiration-time");

		// ================= MAIL =================
		setIfPresent(dotenv, "MAIL_USERNAME", "spring.mail.username");
		setIfPresent(dotenv, "MAIL_PASSWORD", "spring.mail.password");

		// FIX: mapping đúng property (tránh set MAIL_USERNAME 2 lần sai key)
		setIfPresent(dotenv, "MAIL_USERNAME", "app.mail.from");
		setIfPresent(dotenv, "MAIL_FROM_NAME", "app.mail.from-name");

		// ================= VNPAY =================
		setIfPresent(dotenv, "VNPAY_TMN_CODE", "vnpay.tmnCode");
		setIfPresent(dotenv, "VNPAY_HASH_SECRET", "vnpay.hashSecret");
		setIfPresent(dotenv, "VNPAY_RETURN_URL", "vnpay.returnUrl");
		setIfPresent(dotenv, "VNPAY_FRONTEND_RETURN_URL", "vnpay.frontendReturnUrl");
		setIfPresent(dotenv, "VNPAY_IPN_URL", "vnpay.ipnUrl");

		// ================= REDIS =================
		setIfPresent(dotenv, "REDIS_HOST", "spring.data.redis.host");
		setIfPresent(dotenv, "REDIS_PORT", "spring.data.redis.port");
		setIfPresent(dotenv, "REDIS_PASSWORD", "spring.data.redis.password");

		// ================= RABBITMQ =================
		setIfPresent(dotenv, "RABBITMQ_HOST", "spring.rabbitmq.host");
		setIfPresent(dotenv, "RABBITMQ_PORT", "spring.rabbitmq.port");
		setIfPresent(dotenv, "RABBITMQ_USERNAME", "spring.rabbitmq.username");
		setIfPresent(dotenv, "RABBITMQ_PASSWORD", "spring.rabbitmq.password");
		setIfPresent(dotenv, "RABBITMQ_VHOST", "spring.rabbitmq.virtual-host");

		// ================= AI (Gemini via OpenAI API) =================
		setIfPresent(dotenv, "GEMINI_API_KEY", "spring.ai.openai.api-key");

		SpringApplication.run(ServerApplication.class, args);
	}

	private static void setIfPresent(Dotenv dotenv, String envKey, String propKey) {
		String value = dotenv.get(envKey);

		if (value == null || value.isBlank()) {
			return;
		}

		// tránh ghi đè nếu system property đã tồn tại
		if (System.getProperty(propKey) == null) {
			System.setProperty(propKey, value);
		}
	}
}