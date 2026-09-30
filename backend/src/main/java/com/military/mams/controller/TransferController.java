package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.TransferRequestDto;
import com.military.mams.dto.TransferStatusUpdateDto;
import com.military.mams.entity.Transfer;
import com.military.mams.service.TransferService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transfer>>> getTransfers(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Transfer> transfers = transferService.getTransfers(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(transfers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Transfer>> getTransferById(@PathVariable Long id) {
        Transfer transfer = transferService.getTransferById(id);
        return ResponseEntity.ok(ApiResponse.ok(transfer));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Transfer>> initiateTransfer(@RequestBody TransferRequestDto request) {
        Transfer transfer = transferService.initiateTransfer(request);
        return ResponseEntity.ok(ApiResponse.ok("Asset transfer initiated and inventories updated across bases.", transfer));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Transfer>> updateStatus(
            @PathVariable Long id,
            @RequestBody TransferStatusUpdateDto dto) {
        Transfer transfer = transferService.updateTransferStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Transfer status updated.", transfer));
    }
}
