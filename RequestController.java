package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Request;
import com.example.springbootbackend.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class RequestController {

    @Autowired
    private RequestService requestService;

    // Admin Endpoints
    @GetMapping("/admin/requests")
    public List<Request> getAllRequestsForAdmin() {
        return requestService.getAllRequests();
    }

    @PutMapping("/admin/requests/{id}")
    public Request updateRequestForAdmin(@PathVariable Long id, @RequestBody Request request) {
        return requestService.updateRequest(id, request);
    }

    @DeleteMapping("/admin/requests/{id}")
    public ResponseEntity<Void> deleteRequestForAdmin(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    // Employee Endpoints
    @GetMapping("/employee/requests")
    public List<Request> getRequestsForEmployee(@RequestParam String username) {
        return requestService.getRequestsByUser(username);
    }

    @PostMapping("/employee/requests")
    public Request createRequestForEmployee(@RequestBody Request request) {
        return requestService.createRequest(request);
    }
}