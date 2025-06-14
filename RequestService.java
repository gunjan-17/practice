package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Request;
import com.example.springbootbackend.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    public Request createRequest(Request request) {
        return requestRepository.save(request);
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public List<Request> getRequestsByUser(String requestedBy) {
        return requestRepository.findByRequestedBy(requestedBy);
    }

    public Optional<Request> getRequestById(Long id) {
        return requestRepository.findById(id);
    }

    public Request updateRequest(Long id, Request updatedRequest) {
        Optional<Request> existingRequest = requestRepository.findById(id);
        if (existingRequest.isPresent()) {
            Request request = existingRequest.get();
            request.setItemId(updatedRequest.getItemId());
            request.setQuantity(updatedRequest.getQuantity());
            request.setStatus(updatedRequest.getStatus());
            request.setRequestedBy(updatedRequest.getRequestedBy());
            return requestRepository.save(request);
        }
        throw new RuntimeException("Request not found with id: " + id);
    }

    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }
}