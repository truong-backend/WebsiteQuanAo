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

		// ================= DATABASE ==================
		map(dotenv, "DB_URL", "spring.datasource.url");
		map(dotenv, "DB_USERNAME", "spring.datasource.username");
		map(dotenv, "DB_PASSWORD", "spring.datasource.password");

		// ================= JWT =================
		map(dotenv, "JWT_SECRET", "security.jwt.secret-key");
		map(dotenv, "JWT_EXPIRATION", "security.jwt.expiration-time");
		map(dotenv, "JWT_REFRESH_EXPIRATION", "security.jwt.refresh-expiration-time");

		// ================= MAIL =================
		map(dotenv, "MAIL_USERNAME", "spring.mail.username");
		map(dotenv, "MAIL_PASSWORD", "spring.mail.password");
		map(dotenv, "MAIL_USERNAME", "app.mail.from");
		map(dotenv, "MAIL_FROM_NAME", "app.mail.from-name");

		// ================= VNPAY =================
		map(dotenv, "VNPAY_TMN_CODE", "vnpay.tmnCode");
		map(dotenv, "VNPAY_HASH_SECRET", "vnpay.hashSecret");
		map(dotenv, "VNPAY_RETURN_URL", "vnpay.returnUrl");
		map(dotenv, "VNPAY_FRONTEND_RETURN_URL", "vnpay.frontendReturnUrl");
		map(dotenv, "VNPAY_IPN_URL", "vnpay.ipnUrl");

		// ================= REDIS =================
		map(dotenv, "REDIS_HOST", "spring.data.redis.host");
		map(dotenv, "REDIS_PORT", "spring.data.redis.port");
		map(dotenv, "REDIS_PASSWORD", "spring.data.redis.password");

		// ================= RABBITMQ =================
		map(dotenv, "RABBITMQ_HOST", "spring.rabbitmq.host");
		map(dotenv, "RABBITMQ_PORT", "spring.rabbitmq.port");
		map(dotenv, "RABBITMQ_USERNAME", "spring.rabbitmq.username");
		map(dotenv, "RABBITMQ_PASSWORD", "spring.rabbitmq.password");
		map(dotenv, "RABBITMQ_VHOST", "spring.rabbitmq.virtual-host");

		// ================= AI (Gemini) =================
		map(dotenv, "GEMINI_API_KEY", "spring.ai.openai.api-key");

		// ================= MINIO =================
		map(dotenv, "MINIO_ENDPOINT", "minio.endpoint");
		map(dotenv, "MINIO_ACCESS_KEY", "minio.access-key");
		map(dotenv, "MINIO_SECRET_KEY", "minio.secret-key");
		map(dotenv, "MINIO_BUCKET", "minio.bucket");
		map(dotenv, "MINIO_PUBLIC_URL", "minio.public-url");

		SpringApplication.run(ServerApplication.class, args);
	}

	private static void map(Dotenv dotenv, String envKey, String propKey) {
		String value = dotenv.get(envKey);

		if (value == null || value.isBlank()) return;

		// không override nếu đã set qua JVM args hoặc system env
		if (System.getProperty(propKey) == null) {
			System.setProperty(propKey, value);
		}
	}
}