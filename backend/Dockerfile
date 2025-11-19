# =========================================================================
# Stage 1: Build the Spring Boot Application with Maven and JDK 21
# =========================================================================
# Use official Maven image with JDK 21 (eclipse-temurin)
# This stage compiles application code and creates executable JAR file
FROM maven:3.9.6-eclipse-temurin-21 AS build
LABEL maintainer="She-han <shehan@corehive.lk>"

# Set working directory for the application
WORKDIR /app

# First copy pom.xml and download dependencies
# This allows layer caching - if dependencies don't change, build time is reduced
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application using Maven package command
# Use -DskipTests=true to skip running tests during build time
RUN mvn clean package -DskipTests=true

# =========================================================================
# Stage 2: Create the Final Lightweight Runtime Image
# =========================================================================
# Use lightweight image with only JRE (Java Runtime Environment) 21 needed to run the application
# This significantly reduces the final Docker image size
FROM eclipse-temurin:21-jre-jammy

# Create a separate user for running the app (security best practice)
RUN useradd -ms /bin/bash corehive
USER corehive

# Application working directory
WORKDIR /app

# Copy JAR file created in build stage to final image
COPY --from=build /app/target/*.jar /app/application.jar

# Port that container needs to run on (Spring Boot default port)
EXPOSE 8080

# Command to execute when container starts
# Run Spring Boot application using java -jar command
ENTRYPOINT ["java", "-jar", "/app/application.jar"]