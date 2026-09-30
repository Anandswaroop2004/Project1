package com.military.mams.repository;

import com.military.mams.entity.BaseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaseInventoryRepository extends JpaRepository<BaseInventory, Long> {
    List<BaseInventory> findByBaseId(Long baseId);
    Optional<BaseInventory> findByBaseIdAndAssetId(Long baseId, Long assetId);

    @Query("SELECT bi FROM BaseInventory bi WHERE " +
           "(:baseId IS NULL OR bi.base.id = :baseId) AND " +
           "(:categoryId IS NULL OR bi.asset.category.id = :categoryId)")
    List<BaseInventory> findWithFilters(@Param("baseId") Long baseId, @Param("categoryId") Long categoryId);
}
