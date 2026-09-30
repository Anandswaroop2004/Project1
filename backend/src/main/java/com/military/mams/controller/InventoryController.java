package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.entity.BaseInventory;
import com.military.mams.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaseInventory>>> getInventory(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId) {
        List<BaseInventory> list = inventoryService.getInventory(baseId, categoryId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/base/{baseId}")
    public ResponseEntity<ApiResponse<List<BaseInventory>>> getInventoryByBase(@PathVariable Long baseId) {
        List<BaseInventory> list = inventoryService.getInventoryByBase(baseId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
