# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Cache dependencies trước khi copy source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Tạo user không có quyền root để chạy app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy artifact từ stage build
COPY --from=builder /build/target/*.jar app.jar

# Thư mục lưu file upload (sẽ được mount qua volume)
RUN mkdir -p /app/upload /app/data && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]