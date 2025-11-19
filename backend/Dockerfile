# =========================================================================
# Stage 1: Build the Spring Boot Application with Maven and JDK 21
# =========================================================================
# Official Maven image එකක් use කරනවා, ඒකෙ JDK 21 (eclipse-temurin) තියෙනවා.
# මේ stage එකේදී application code එක compile කරලා executable JAR file එක හදනවා.
FROM maven:3.9.6-eclipse-temurin-21 AS build
LABEL maintainer="She-han <shehan@corehive.lk>"

# Application එකේ working directory එක set කරනවා
WORKDIR /app

# මුලින්ම pom.xml එක copy කරලා dependencies download කරනවා.
# මේකෙන් source code change උනත්, dependencies change උනේ නැත්නම් layer cache use වෙනවා, build time එක අඩු වෙනවා.
COPY pom.xml .
RUN mvn dependency:go-offline

# Source code එකේ ඉතුරු ටික copy කරනවා
COPY src ./src

# Maven package command එකෙන් application එක build කරනවා.
# -DskipTests=true use කරලා build time එකේදී tests run වෙන එක නවත්තනවා.
RUN mvn clean package -DskipTests=true

# =========================================================================
# Stage 2: Create the Final Lightweight Runtime Image
# =========================================================================
# Application එක run කරන්න විතරක් අවශ්‍ය JRE (Java Runtime Environment) 21 තියෙන lightweight image එකක් use කරනවා.
# මේකෙන් final Docker image size එක ගොඩක් අඩු වෙනවා.
FROM eclipse-temurin:21-jre-jammy

# App එකට run වෙන්න වෙනම user කෙනෙක් create කරනවා (security best practice)
RUN useradd -ms /bin/bash corehive
USER corehive

# Application එකේ working directory එක
WORKDIR /app

# Build stage එකෙන් හදපු JAR file එක final image එකට copy කරනවා
COPY --from=build /app/target/*.jar /app/application.jar

# Container එක run වෙන්න ඕනේ port එක (Spring Boot default port)
EXPOSE 8080

# Container එක start වෙද්දී execute වෙන command එක
# java -jar command එකෙන් Spring Boot application එක run කරනවා
ENTRYPOINT ["java", "-jar", "/app/application.jar"]