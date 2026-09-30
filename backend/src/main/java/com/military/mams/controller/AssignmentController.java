package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.AssignmentRequestDto;
import com.military.mams.dto.AssignmentReturnDto;
import com.military.mams.entity.AssetAssignment;
import com.military.mams.entity.AssignmentStatus;
import com.military.mams.service.AssignmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetAssignment>>> getAssignments(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AssetAssignment> list = assignmentService.getAssignments(baseId, categoryId, status, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetAssignment>> getAssignmentById(@PathVariable Long id) {
        AssetAssignment assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.ok(assignment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetAssignment>> assignAsset(@RequestBody AssignmentRequestDto request) {
        AssetAssignment assignment = assignmentService.assignAsset(request);
        return ResponseEntity.ok(ApiResponse.ok("Asset assigned to personnel successfully.", assignment));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<AssetAssignment>> returnAsset(
            @PathVariable Long id,
            @RequestBody(required = false) AssignmentReturnDto returnDto) {
        if (returnDto == null) {
            returnDto = new AssignmentReturnDto();
        }
        AssetAssignment assignment = assignmentService.returnAsset(id, returnDto);
        return ResponseEntity.ok(ApiResponse.ok("Asset returned to base inventory successfully.", assignment));
    }
}
