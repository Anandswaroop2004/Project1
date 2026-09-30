package com.military.mams.service;

import com.military.mams.entity.Asset;
import com.military.mams.entity.AssetCategory;
import com.military.mams.repository.AssetCategoryRepository;
import com.military.mams.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;

    public AssetService(AssetRepository assetRepository, AssetCategoryRepository categoryRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public List<Asset> getAssetsByCategory(Long categoryId) {
        return assetRepository.findByCategoryId(categoryId);
    }

    public List<AssetCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
