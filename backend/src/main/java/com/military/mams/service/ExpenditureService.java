package com.military.mams.service;

import com.military.mams.dto.ExpenditureRequestDto;
import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenditureService {

    private final AssetExpenditureRepository expenditureRepository;
    private final BaseInventoryRepository inventoryRepository;
    private final MilitaryBaseRepository baseRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ExpenditureService(AssetExpenditureRepository expenditureRepository,
                              BaseInventoryRepository inventoryRepository,
                              MilitaryBaseRepository baseRepository,
                              AssetRepository assetRepository,
                              UserRepository userRepository,
                              AuditLogService auditLogService) {
        this.expenditureRepository = expenditureRepository;
        this.inventoryRepository = inventoryRepository;
        this.baseRepository = baseRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<AssetExpenditure> getExpenditures(Long baseId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        return expenditureRepository.findWithFilters(baseId, categoryId, startDate, endDate);
    }

    public AssetExpenditure getExpenditureById(Long id) {
        return expenditureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expenditure record not found with ID: " + id));
    }

    @Transactional
    public AssetExpenditure recordExpenditure(ExpenditureRequestDto req) {
        MilitaryBase base = baseRepository.findById(req.getBaseId())
                .orElseThrow(() -> new RuntimeException("Base not found: " + req.getBaseId()));

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + req.getAssetId()));

        if (req.getQuantity() == null || req.getQuantity() <= 0) {
            throw new RuntimeException("Expenditure quantity must be greater than zero.");
        }

        BaseInventory inventory = inventoryRepository.findByBaseIdAndAssetId(base.getId(), asset.getId())
                .orElseThrow(() -> new RuntimeException("No inventory record for '" + asset.getName() + "' at " + base.getName()));

        if (inventory.getCurrentBalance() < req.getQuantity()) {
            throw new RuntimeException("Insufficient available inventory to expend. Available: " + inventory.getCurrentBalance() + ", Requested: " + req.getQuantity());
        }

        User recordedBy = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            recordedBy = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        String expCode = req.getExpenditureCode();
        if (expCode == null || expCode.trim().isEmpty()) {
            expCode = "EXP-" + System.currentTimeMillis();
        }

        AssetExpenditure exp = new AssetExpenditure();
        exp.setExpenditureCode(expCode);
        exp.setBase(base);
        exp.setAsset(asset);
        exp.setQuantity(req.getQuantity());
        exp.setExpendedDate(req.getExpendedDate() != null ? req.getExpendedDate() : LocalDateTime.now());
        exp.setMissionOrExercise(req.getMissionOrExercise());
        exp.setAuthorizedOfficer(req.getAuthorizedOfficer());
        exp.setRecordedBy(recordedBy);
        exp.setRemarks(req.getRemarks());

        AssetExpenditure saved = expenditureRepository.save(exp);

        // Update Base Inventory expended count and recalculate balances
        inventory.setExpendedQuantity((inventory.getExpendedQuantity() != null ? inventory.getExpendedQuantity() : 0) + req.getQuantity());
        inventory.recalculateBalances();
        inventoryRepository.save(inventory);

        // Audit Log
        String details = String.format("Recorded expenditure of %d %s at base '%s' for '%s' authorized by %s",
                req.getQuantity(), asset.getName(), base.getName(), req.getMissionOrExercise(), req.getAuthorizedOfficer());
        auditLogService.logAction("ASSET_EXPENDED", "AssetExpenditure", expCode, details);

        return saved;
    }
}
