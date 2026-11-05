FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY certs/aiven-ca.pem /app/certs/aiven-ca.pem

RUN keytool -importcert \
    -noprompt \
    -cacerts \
    -alias foodie-aiven-ca \
    -file /app/certs/aiven-ca.pem \
    -storepass changeit

COPY --from=build /app/target/foodie-new-backend-1.0.0.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]