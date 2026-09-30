package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.DashboardMetricsDto;
import com.military.mams.dto.NetMovementBreakdownDto;
import com.military.mams.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getMetrics(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        DashboardMetricsDto metrics = dashboardService.getMetrics(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/net-movement-details")
    public ResponseEntity<ApiResponse<NetMovementBreakdownDto>> getNetMovementDetails(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        NetMovementBreakdownDto breakdown = dashboardService.getNetMovementBreakdown(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(breakdown));
    }

    @GetMapping("/category-summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategorySummary(
            @RequestParam(required = false) Long baseId) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getCategorySummary(baseId)));
    }

    @GetMapping("/base-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBaseDistribution(
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getBaseDistribution(categoryId)));
    }
}
