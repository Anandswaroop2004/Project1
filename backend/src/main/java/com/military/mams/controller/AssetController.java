package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.entity.Asset;
import com.military.mams.entity.AssetCategory;
import com.military.mams.service.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(ApiResponse.ok(assetService.getAssetsByCategory(categoryId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(assetService.getAllAssets()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<AssetCategory>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(assetService.getAllCategories()));
    }
}
