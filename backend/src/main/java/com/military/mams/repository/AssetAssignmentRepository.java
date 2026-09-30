package com.military.mams.repository;

import com.military.mams.entity.AssetAssignment;
import com.military.mams.entity.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    Optional<AssetAssignment> findByAssignmentCode(String assignmentCode);
    List<AssetAssignment> findByBaseId(Long baseId);
    List<AssetAssignment> findByStatus(AssignmentStatus status);

    @Query("SELECT a FROM AssetAssignment a WHERE " +
           "(:baseId IS NULL OR a.base.id = :baseId) AND " +
           "(:categoryId IS NULL OR a.asset.category.id = :categoryId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:startDate IS NULL OR a.assignedDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.assignedDate <= :endDate) " +
           "ORDER BY a.assignedDate DESC")
    List<AssetAssignment> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("categoryId") Long categoryId,
            @Param("status") AssignmentStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
