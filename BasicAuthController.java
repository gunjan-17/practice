package com.example.springbootbackend.controller;

import com.example.springbootbackend.bean.AuthenticationBean;
import com.example.springbootbackend.model.User;
import com.example.springbootbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class BasicAuthController {

    @Autowired
    private UserService userService;

    @GetMapping(path = "/basicauth")
    public ResponseEntity<AuthenticationBean> basicauth(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            String credentials = new String(java.util.Base64.getDecoder().decode(base64Credentials));
            String[] values = credentials.split(":", 2);
            String username = values[0];
            String password = values[1];

            User user = userService.validateUser(username, password);
            if (user != null) {
                return new ResponseEntity<>(new AuthenticationBean("You are authenticated", user.getRole()), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(new AuthenticationBean("Authentication failed"), HttpStatus.UNAUTHORIZED);
    }
}