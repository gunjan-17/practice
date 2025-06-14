package com.example.springbootbackend.controller;

import com.example.springbootbackend.model.Item;
import com.example.springbootbackend.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/v1")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // Admin Endpoints
    @GetMapping("/admin/items")
    public List<Item> getAllItemsForAdmin() {
        return itemService.getAllItems();
    }

    @PostMapping("/admin/items")
    public Item createItemForAdmin(@RequestBody Item item) {
        return itemService.createItem(item);
    }

    @PutMapping("/admin/items/{id}")
    public Item updateItemForAdmin(@PathVariable Long id, @RequestBody Item item) {
        return itemService.updateItem(id, item);
    }

    @DeleteMapping("/admin/items/{id}")
    public ResponseEntity<Void> deleteItemForAdmin(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // Employee Endpoints
    @GetMapping("/employee/items")
    public List<Item> getAllItemsForEmployee() {
        return itemService.getAllItems();
    }

    @PostMapping("/employee/items")
    public Item createItemForEmployee(@RequestBody Item item) {
        return itemService.createItem(item);
    }

    @PutMapping("/employee/items/{id}")
    public Item updateItemForEmployee(@PathVariable Long id, @RequestBody Item item) {
        return itemService.updateItem(id, item);
    }
}