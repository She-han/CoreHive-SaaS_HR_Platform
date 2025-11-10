package com.corehive.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * CoreHive Backend Application
 * Spring Boot application main class
 */
@SpringBootApplication
@EnableTransactionManagement // @Transactional annotations enable කරන්න
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);

		// Application startup message
		System.out.println("\n" +
				"╔══════════════════════════════════════════╗\n" +
				"║        CoreHive Backend Started          ║\n" +
				"║                                          ║\n" +
				"║  🌐 Server: http://localhost:8080        ║\n" +
				"║  📋 Health: /actuator/health             ║\n" +
				"║  🧪 Test: /api/test                      ║\n" +
				"║                                          ║\n" +
				"║  Ready to serve CoreHive Frontend!       ║\n" +
				"╚══════════════════════════════════════════╝\n");
	}
}