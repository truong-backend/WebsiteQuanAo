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
		setIfPresent(dotenv, "DB_URL",      "spring.datasource.url");
		setIfPresent(dotenv, "DB_USERNAME", "spring.datasource.username");
//      setIfPresent(dotenv, "DB_PASSWORD", "spring.datasource.password");

		// ================= JWT =================
		setIfPresent(dotenv, "JWT_SECRET", "security.jwt.secret-key");

		// ================= MAIL =================
		setIfPresent(dotenv, "MAIL_USERNAME", "spring.mail.username");
		setIfPresent(dotenv, "MAIL_USERNAME", "app.mail.from");        // ← thêm
		setIfPresent(dotenv, "MAIL_PASSWORD", "spring.mail.password");
		setIfPresent(dotenv, "MAIL_FROM_NAME", "app.mail.from-name");  // ← thêm (optional)

		// ================= VNPAY =================
		setIfPresent(dotenv, "VNPAY_TMN_CODE",            "vnpay.tmnCode");
		setIfPresent(dotenv, "VNPAY_HASH_SECRET",         "vnpay.hashSecret");
		setIfPresent(dotenv, "VNPAY_RETURN_URL",          "vnpay.returnUrl");
		setIfPresent(dotenv, "VNPAY_FRONTEND_RETURN_URL", "vnpay.frontendReturnUrl");
		setIfPresent(dotenv, "VNPAY_IPN_URL",             "vnpay.ipnUrl");

		// ================= GEMINI =================
//		setIfPresent(dotenv, "GEMINI_API_KEY", "gemini.api.key");      // ← thêm

		SpringApplication.run(ServerApplication.class, args);
	}

	private static void setIfPresent(Dotenv dotenv, String envKey, String propKey) {
		String value = dotenv.get(envKey);
		if (value != null && !value.isBlank()) {
			System.setProperty(propKey, value);
		}
	}
}