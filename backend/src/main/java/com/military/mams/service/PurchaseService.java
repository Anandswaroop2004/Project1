package com.military.mams.service;

import com.military.mams.dto.PurchaseRequestDto;
import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BaseInventoryRepository inventoryRepository;
    private final MilitaryBaseRepository baseRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           BaseInventoryRepository inventoryRepository,
                           MilitaryBaseRepository baseRepository,
                           AssetRepository assetRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.purchaseRepository = purchaseRepository;
        this.inventoryRepository = inventoryRepository;
        this.baseRepository = baseRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<Purchase> getPurchases(Long baseId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        return purchaseRepository.findWithFilters(baseId, categoryId, startDate, endDate);
    }

    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
    }

    @Transactional
    public Purchase recordPurchase(PurchaseRequestDto req) {
        MilitaryBase base = baseRepository.findById(req.getBaseId())
                .orElseThrow(() -> new RuntimeException("Base not found with ID: " + req.getBaseId()));

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + req.getAssetId()));

        if (req.getQuantity() == null || req.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than zero.");
        }

        BigDecimal unitCost = req.getUnitCost() != null ? req.getUnitCost() : asset.getUnitPrice();
        BigDecimal totalCost = unitCost.multiply(BigDecimal.valueOf(req.getQuantity()));

        String poNum = req.getPurchaseOrderNumber();
        if (poNum == null || poNum.trim().isEmpty()) {
            poNum = "PO-" + System.currentTimeMillis();
        }

        User receivedBy = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            receivedBy = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        Purchase purchase = new Purchase();
        purchase.setPurchaseOrderNumber(poNum);
        purchase.setBase(base);
        purchase.setAsset(asset);
        purchase.setQuantity(req.getQuantity());
        purchase.setUnitCost(unitCost);
        purchase.setTotalCost(totalCost);
        purchase.setSupplier(req.getSupplier() != null ? req.getSupplier() : "Authorized Defense Supplier");
        purchase.setPurchaseDate(req.getPurchaseDate() != null ? req.getPurchaseDate() : LocalDateTime.now());
        purchase.setReceivedBy(receivedBy);
        purchase.setStatus("RECEIVED");
        purchase.setNotes(req.getNotes());

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Update Base Inventory
        BaseInventory inventory = inventoryRepository.findByBaseIdAndAssetId(base.getId(), asset.getId())
                .orElseGet(() -> {
                    BaseInventory newInv = new BaseInventory();
                    newInv.setBase(base);
                    newInv.setAsset(asset);
                    newInv.setOpeningBalance(0);
                    newInv.setAssignedQuantity(0);
                    newInv.setExpendedQuantity(0);
                    newInv.setTotalPurchased(0);
                    newInv.setTotalTransferredIn(0);
                    newInv.setTotalTransferredOut(0);
                    return newInv;
                });

        inventory.setTotalPurchased((inventory.getTotalPurchased() != null ? inventory.getTotalPurchased() : 0) + req.getQuantity());
        inventory.recalculateBalances();
        inventoryRepository.save(inventory);

        // Audit Logging
        String details = String.format("Recorded purchase of %d %s for base '%s' (PO: %s, Cost: $%s)",
                req.getQuantity(), asset.getName(), base.getName(), poNum, totalCost.toString());
        auditLogService.logAction("PURCHASE_RECORDED", "Purchase", poNum, details);

        return savedPurchase;
    }
}
