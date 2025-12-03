package com.corehive.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {


    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendPasswordEmail(String toEmail, String tempPassword, String orgName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("shehangarusinghe@gmail.com");
        message.setTo(toEmail);
        message.setSubject("CoreHive - "+orgName+" Organization Approved");
        message.setText("Congratulations! Your organization request has been approved.\n\n" +
                "Here are your login credentials:\n" +
                "Email: " + toEmail + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "Please login and change your password immediately. Then configure your HR management workspace as you wish.\n\n" +
                "Thank you for choosing CoreHive!\n\n" );


        mailSender.send(message);
        System.out.println("Email sent successfully to " + toEmail);
    }

    @Async
    public void sendUserPasswordEmail(String toEmail, String tempPassword, String orgName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("shehangarusinghe@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Congratulations! - You're added as a "+orgName+"'s HR Staff member.");
        message.setText("You are added as a HR management staff member for "+orgName+" via CoreHive HR management platform.\n\n" +
                "Here are your login credentials:\n" +
                "Email: " + toEmail + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "Please login and change your password immediately.\n\n" );

        mailSender.send(message);
        System.out.println("Email sent successfully to " + toEmail);
    }

        @Async
    public void sendForgotPasswordEmail(String toEmail, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("shehangarusinghe@gmail.com");
        message.setTo(toEmail);
        message.setSubject("CoreHive - Password Reset Request");
        message.setText("You have requested to reset your password for CoreHive.\n\n" +
                "Here is your new temporary password:\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "Please login using this password. You will be required to set a new password immediately upon login.\n\n" +
                "If you did not request this, please contact your administrator immediately.");

        mailSender.send(message);
        System.out.println("Forgot password email sent successfully to " + toEmail);
    }
}