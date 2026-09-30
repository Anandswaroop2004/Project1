package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.ExpenditureRequestDto;
import com.military.mams.entity.AssetExpenditure;
import com.military.mams.service.ExpenditureService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/expenditures")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExpenditureController {

    private final ExpenditureService expenditureService;

    public ExpenditureController(ExpenditureService expenditureService) {
        this.expenditureService = expenditureService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetExpenditure>>> getExpenditures(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AssetExpenditure> list = expenditureService.getExpenditures(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetExpenditure>> getExpenditureById(@PathVariable Long id) {
        AssetExpenditure exp = expenditureService.getExpenditureById(id);
        return ResponseEntity.ok(ApiResponse.ok(exp));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetExpenditure>> recordExpenditure(@RequestBody ExpenditureRequestDto request) {
        AssetExpenditure exp = expenditureService.recordExpenditure(request);
        return ResponseEntity.ok(ApiResponse.ok("Asset expenditure recorded and inventory updated.", exp));
    }
}
