package com.example.springbootbackend.service;

import com.example.springbootbackend.model.Item;
import com.example.springbootbackend.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public Item updateItem(Long id, Item updatedItem) {
        Optional<Item> existingItem = itemRepository.findById(id);
        if (existingItem.isPresent()) {
            Item item = existingItem.get();
            item.setName(updatedItem.getName());
            item.setDescription(updatedItem.getDescription());
            item.setQuantity(updatedItem.getQuantity());
            return itemRepository.save(item);
        }
        throw new RuntimeException("Item not found with id: " + id);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
}