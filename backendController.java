package com.example.springbootbackend.controller;

import com.example.springbootbackend.bean.AuthenticationBean;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class BasicAuthController {

    @GetMapping("/dashboard")
    public AuthenticationBean dashboard(Authentication authentication) {
        // Optional: get roles
        String roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));

        return new AuthenticationBean("You are authenticated with roles: " + roles);
    }
}