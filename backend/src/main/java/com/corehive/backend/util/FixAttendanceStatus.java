package com.corehive.backend.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Utility to fix attendance status data issue
 * Run this as a standalone Java application before starting the main application
 */
public class FixAttendanceStatus {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/corehive_db";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "1234";
    
    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Connected to database successfully!");
            
            // Step 1: Check for invalid status values
            System.out.println("\n=== Checking for invalid status values ===");
            String checkQuery = "SELECT id, employee_id, attendance_date, status FROM attendance " +
                              "WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME')";
            
            ResultSet rs = stmt.executeQuery(checkQuery);
            int invalidCount = 0;
            
            System.out.println("Invalid records found:");
            while (rs.next()) {
                invalidCount++;
                System.out.printf("ID: %d, Employee: %d, Date: %s, Status: %s%n",
                    rs.getLong("id"),
                    rs.getLong("employee_id"),
                    rs.getDate("attendance_date"),
                    rs.getString("status"));
            }
            rs.close();
            
            if (invalidCount == 0) {
                System.out.println("No invalid records found. Database is clean!");
                return;
            }
            
            System.out.println("\nTotal invalid records: " + invalidCount);
            
            // Step 2: Fix the invalid status values
            System.out.println("\n=== Fixing invalid status values ===");
            String updateQuery = "UPDATE attendance SET status = 'PRESENT' " +
                               "WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME')";
            
            int updatedRows = stmt.executeUpdate(updateQuery);
            System.out.println("Updated " + updatedRows + " rows to status 'PRESENT'");
            
            // Step 3: Verify the fix
            System.out.println("\n=== Verifying fix ===");
            rs = stmt.executeQuery(checkQuery);
            int remainingInvalid = 0;
            while (rs.next()) {
                remainingInvalid++;
            }
            rs.close();
            
            if (remainingInvalid == 0) {
                System.out.println("✓ All invalid records have been fixed!");
                System.out.println("✓ You can now start the backend application.");
            } else {
                System.out.println("✗ Warning: " + remainingInvalid + " invalid records still remain.");
            }
            
            // Step 4: Show current status distribution
            System.out.println("\n=== Current status distribution ===");
            String distributionQuery = "SELECT status, COUNT(*) as count FROM attendance GROUP BY status ORDER BY status";
            rs = stmt.executeQuery(distributionQuery);
            
            while (rs.next()) {
                System.out.printf("%s: %d records%n", rs.getString("status"), rs.getInt("count"));
            }
            rs.close();
            
        } catch (Exception e) {
            System.err.println("Error fixing attendance status:");
            e.printStackTrace();
            System.err.println("\nPlease run the SQL script manually: fix_attendance_quick.sql");
        }
    }
}
