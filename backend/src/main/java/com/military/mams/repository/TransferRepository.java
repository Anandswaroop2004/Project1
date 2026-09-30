package com.military.mams.repository;

import com.military.mams.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    Optional<Transfer> findByTransferNumber(String transferNumber);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:baseId IS NULL OR t.sourceBase.id = :baseId OR t.destinationBase.id = :baseId) AND " +
           "(:categoryId IS NULL OR t.asset.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR t.dispatchedAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.dispatchedAt <= :endDate) " +
           "ORDER BY t.dispatchedAt DESC")
    List<Transfer> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:baseId IS NULL OR t.destinationBase.id = :baseId) AND " +
           "(:categoryId IS NULL OR t.asset.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR t.dispatchedAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.dispatchedAt <= :endDate) " +
           "ORDER BY t.dispatchedAt DESC")
    List<Transfer> findTransfersInWithFilters(
            @Param("baseId") Long baseId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:baseId IS NULL OR t.sourceBase.id = :baseId) AND " +
           "(:categoryId IS NULL OR t.asset.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR t.dispatchedAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.dispatchedAt <= :endDate) " +
           "ORDER BY t.dispatchedAt DESC")
    List<Transfer> findTransfersOutWithFilters(
            @Param("baseId") Long baseId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
