package com.military.mams.service;

import com.military.mams.entity.BaseInventory;
import com.military.mams.repository.BaseInventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final BaseInventoryRepository inventoryRepository;

    public InventoryService(BaseInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<BaseInventory> getInventory(Long baseId, Long categoryId) {
        return inventoryRepository.findWithFilters(baseId, categoryId);
    }

    public List<BaseInventory> getInventoryByBase(Long baseId) {
        return inventoryRepository.findByBaseId(baseId);
    }
}
