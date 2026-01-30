FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17.0.1-jdk-slim
COPY --from=build /target/assignment1-0.0.1-SNAPSHOT.jar ass_1.jar
EXPOSE 8080
ENTRYPOINT["java","-jar","ass_1.jar"]