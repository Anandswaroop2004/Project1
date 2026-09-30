package com.military.mams.repository;

import com.military.mams.entity.AssetExpenditure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetExpenditureRepository extends JpaRepository<AssetExpenditure, Long> {
    Optional<AssetExpenditure> findByExpenditureCode(String expenditureCode);
    List<AssetExpenditure> findByBaseId(Long baseId);

    @Query("SELECT e FROM AssetExpenditure e WHERE " +
           "(:baseId IS NULL OR e.base.id = :baseId) AND " +
           "(:categoryId IS NULL OR e.asset.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR e.expendedDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expendedDate <= :endDate) " +
           "ORDER BY e.expendedDate DESC")
    List<AssetExpenditure> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
