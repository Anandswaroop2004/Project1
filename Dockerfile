FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/src src
RUN chmod +x mvnw
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/mams-backend-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
