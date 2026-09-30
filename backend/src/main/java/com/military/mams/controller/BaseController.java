package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.entity.MilitaryBase;
import com.military.mams.service.MilitaryBaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BaseController {

    private final MilitaryBaseService baseService;

    public BaseController(MilitaryBaseService baseService) {
        this.baseService = baseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MilitaryBase>>> getAllBases() {
        return ResponseEntity.ok(ApiResponse.ok(baseService.getAllBases()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MilitaryBase>> getBaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(baseService.getBaseById(id)));
    }
}
