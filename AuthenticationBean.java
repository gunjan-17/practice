package com.example.springbootbackend.bean;

public class AuthenticationBean {
    private String message;
    private String role;

    public AuthenticationBean(String message) {
        this.message = message;
        this.role = null;
    }

    public AuthenticationBean(String message, String role) {
        this.message = message;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}