package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.PurchaseRequestDto;
import com.military.mams.entity.Purchase;
import com.military.mams.service.PurchaseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getPurchases(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Purchase> purchases = purchaseService.getPurchases(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(purchases));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Purchase>> getPurchaseById(@PathVariable Long id) {
        Purchase purchase = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(ApiResponse.ok(purchase));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> recordPurchase(@RequestBody PurchaseRequestDto request) {
        Purchase purchase = purchaseService.recordPurchase(request);
        return ResponseEntity.ok(ApiResponse.ok("Purchase recorded and inventory updated successfully.", purchase));
    }
}
