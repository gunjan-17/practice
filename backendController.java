package com.example.springbootbackend.controller;

import com.example.springbootbackend.bean.AuthenticationBean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class BasicAuthController {

    @GetMapping(path = "/basicauth")
    public ResponseEntity<AuthenticationBean> basicauth(@RequestHeader("Authorization") String authHeader) {
        // Extract and validate the Basic Auth token
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            String credentials = new String(java.util.Base64.getDecoder().decode(base64Credentials));
            // Credentials format: "username:password"
            String[] values = credentials.split(":", 2);
            String username = values[0];
            String password = values[1];

            // For demo purposes, hardcoding credentials
            // In production, validate against a user database or service
            if ("admin".equals(username) && "admin".equals(password) || 
                "employee".equals(username) && "employee".equals(password)) {
                return new ResponseEntity<>(new AuthenticationBean("You are authenticated"), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(new AuthenticationBean("Authentication failed"), HttpStatus.UNAUTHORIZED);
    }
}