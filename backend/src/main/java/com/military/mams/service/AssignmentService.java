package com.military.mams.service;

import com.military.mams.dto.AssignmentRequestDto;
import com.military.mams.dto.AssignmentReturnDto;
import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssetAssignmentRepository assignmentRepository;
    private final BaseInventoryRepository inventoryRepository;
    private final MilitaryBaseRepository baseRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AssignmentService(AssetAssignmentRepository assignmentRepository,
                             BaseInventoryRepository inventoryRepository,
                             MilitaryBaseRepository baseRepository,
                             AssetRepository assetRepository,
                             UserRepository userRepository,
                             AuditLogService auditLogService) {
        this.assignmentRepository = assignmentRepository;
        this.inventoryRepository = inventoryRepository;
        this.baseRepository = baseRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<AssetAssignment> getAssignments(Long baseId, Long categoryId, AssignmentStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        return assignmentRepository.findWithFilters(baseId, categoryId, status, startDate, endDate);
    }

    public AssetAssignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment record not found with ID: " + id));
    }

    @Transactional
    public AssetAssignment assignAsset(AssignmentRequestDto req) {
        MilitaryBase base = baseRepository.findById(req.getBaseId())
                .orElseThrow(() -> new RuntimeException("Base not found: " + req.getBaseId()));

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + req.getAssetId()));

        int qty = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;

        BaseInventory inventory = inventoryRepository.findByBaseIdAndAssetId(base.getId(), asset.getId())
                .orElseThrow(() -> new RuntimeException("No inventory found for '" + asset.getName() + "' at " + base.getName()));

        if (inventory.getCurrentBalance() < qty) {
            throw new RuntimeException("Insufficient available stock. Available: " + inventory.getCurrentBalance() + ", Requested: " + qty);
        }

        User assignedBy = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            assignedBy = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        String asgCode = req.getAssignmentCode();
        if (asgCode == null || asgCode.trim().isEmpty()) {
            asgCode = "ASG-" + System.currentTimeMillis();
        }

        AssetAssignment assignment = new AssetAssignment();
        assignment.setAssignmentCode(asgCode);
        assignment.setBase(base);
        assignment.setAsset(asset);
        assignment.setAssignedToName(req.getAssignedToName());
        assignment.setAssignedToRank(req.getAssignedToRank() != null ? req.getAssignedToRank() : "Soldier");
        assignment.setAssignedToServiceId(req.getAssignedToServiceId());
        assignment.setUnitOrSquadron(req.getUnitOrSquadron());
        assignment.setQuantity(qty);
        assignment.setAssignedDate(req.getAssignedDate() != null ? req.getAssignedDate() : LocalDateTime.now());
        assignment.setExpectedReturnDate(req.getExpectedReturnDate());
        assignment.setConditionOnIssue(req.getConditionOnIssue() != null ? req.getConditionOnIssue() : "EXCELLENT");
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setAssignedBy(assignedBy);
        assignment.setNotes(req.getNotes());

        AssetAssignment saved = assignmentRepository.save(assignment);

        // Update assigned quantity in inventory
        inventory.setAssignedQuantity((inventory.getAssignedQuantity() != null ? inventory.getAssignedQuantity() : 0) + qty);
        inventory.recalculateBalances();
        inventoryRepository.save(inventory);

        // Audit Log
        String details = String.format("Assigned %d unit(s) of %s to %s (%s, ID: %s) at %s",
                qty, asset.getName(), req.getAssignedToName(), req.getAssignedToRank(), req.getAssignedToServiceId(), base.getName());
        auditLogService.logAction("ASSET_ASSIGNED", "AssetAssignment", asgCode, details);

        return saved;
    }

    @Transactional
    public AssetAssignment returnAsset(Long id, AssignmentReturnDto dto) {
        AssetAssignment assignment = getAssignmentById(id);
        if (assignment.getStatus() == AssignmentStatus.RETURNED) {
            throw new RuntimeException("This asset has already been returned.");
        }

        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : AssignmentStatus.RETURNED);
        assignment.setReturnedDate(dto.getReturnedDate() != null ? dto.getReturnedDate() : LocalDateTime.now());
        assignment.setConditionOnReturn(dto.getConditionOnReturn() != null ? dto.getConditionOnReturn() : "GOOD");
        if (dto.getNotes() != null) {
            assignment.setNotes((assignment.getNotes() != null ? assignment.getNotes() + " | Return Notes: " : "") + dto.getNotes());
        }

        AssetAssignment updated = assignmentRepository.save(assignment);

        // Release assigned quantity back to available inventory
        BaseInventory inventory = inventoryRepository.findByBaseIdAndAssetId(assignment.getBase().getId(), assignment.getAsset().getId())
                .orElse(null);

        if (inventory != null) {
            int currentAssigned = inventory.getAssignedQuantity() != null ? inventory.getAssignedQuantity() : 0;
            inventory.setAssignedQuantity(Math.max(0, currentAssigned - assignment.getQuantity()));
            inventory.recalculateBalances();
            inventoryRepository.save(inventory);
        }

        // Audit Log
        String details = String.format("Returned %d unit(s) of %s from %s (Status: %s, Condition: %s)",
                assignment.getQuantity(), assignment.getAsset().getName(), assignment.getAssignedToName(), assignment.getStatus(), assignment.getConditionOnReturn());
        auditLogService.logAction("ASSET_RETURNED", "AssetAssignment", assignment.getAssignmentCode(), details);

        return updated;
    }
}
