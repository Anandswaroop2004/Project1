package com.military.mams.service;

import com.military.mams.dto.TransferRequestDto;
import com.military.mams.dto.TransferStatusUpdateDto;
import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final BaseInventoryRepository inventoryRepository;
    private final MilitaryBaseRepository baseRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TransferService(TransferRepository transferRepository,
                           BaseInventoryRepository inventoryRepository,
                           MilitaryBaseRepository baseRepository,
                           AssetRepository assetRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.transferRepository = transferRepository;
        this.inventoryRepository = inventoryRepository;
        this.baseRepository = baseRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<Transfer> getTransfers(Long baseId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        return transferRepository.findWithFilters(baseId, categoryId, startDate, endDate);
    }

    public Transfer getTransferById(Long id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transfer record not found with ID: " + id));
    }

    @Transactional
    public Transfer initiateTransfer(TransferRequestDto req) {
        if (req.getSourceBaseId().equals(req.getDestinationBaseId())) {
            throw new RuntimeException("Source base and destination base cannot be the same.");
        }

        if (req.getQuantity() == null || req.getQuantity() <= 0) {
            throw new RuntimeException("Transfer quantity must be greater than zero.");
        }

        MilitaryBase sourceBase = baseRepository.findById(req.getSourceBaseId())
                .orElseThrow(() -> new RuntimeException("Source base not found: " + req.getSourceBaseId()));

        MilitaryBase destBase = baseRepository.findById(req.getDestinationBaseId())
                .orElseThrow(() -> new RuntimeException("Destination base not found: " + req.getDestinationBaseId()));

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + req.getAssetId()));

        // Check source inventory
        BaseInventory sourceInv = inventoryRepository.findByBaseIdAndAssetId(sourceBase.getId(), asset.getId())
                .orElseThrow(() -> new RuntimeException("Source base '" + sourceBase.getName() + "' has no inventory record for '" + asset.getName() + "'."));

        if (sourceInv.getCurrentBalance() < req.getQuantity()) {
            throw new RuntimeException("Insufficient available balance at " + sourceBase.getName() +
                    ". Available: " + sourceInv.getCurrentBalance() + ", Requested: " + req.getQuantity());
        }

        User initiatedBy = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            initiatedBy = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        String trfNum = req.getTransferNumber();
        if (trfNum == null || trfNum.trim().isEmpty()) {
            trfNum = "TRF-" + System.currentTimeMillis();
        }

        Transfer transfer = new Transfer();
        transfer.setTransferNumber(trfNum);
        transfer.setSourceBase(sourceBase);
        transfer.setDestinationBase(destBase);
        transfer.setAsset(asset);
        transfer.setQuantity(req.getQuantity());
        transfer.setStatus(TransferStatus.COMPLETED); // Instant direct transfer or can transition
        transfer.setInitiatedBy(initiatedBy);
        transfer.setReceivedBy(initiatedBy);
        transfer.setDispatchedAt(req.getDispatchedAt() != null ? req.getDispatchedAt() : LocalDateTime.now());
        transfer.setCompletedAt(LocalDateTime.now());
        transfer.setReasonOrMission(req.getReasonOrMission());

        Transfer savedTransfer = transferRepository.save(transfer);

        // Deduct transfer out from source base
        sourceInv.setTotalTransferredOut((sourceInv.getTotalTransferredOut() != null ? sourceInv.getTotalTransferredOut() : 0) + req.getQuantity());
        sourceInv.recalculateBalances();
        inventoryRepository.save(sourceInv);

        // Add transfer in to destination base
        BaseInventory destInv = inventoryRepository.findByBaseIdAndAssetId(destBase.getId(), asset.getId())
                .orElseGet(() -> {
                    BaseInventory newInv = new BaseInventory();
                    newInv.setBase(destBase);
                    newInv.setAsset(asset);
                    newInv.setOpeningBalance(0);
                    newInv.setAssignedQuantity(0);
                    newInv.setExpendedQuantity(0);
                    newInv.setTotalPurchased(0);
                    newInv.setTotalTransferredIn(0);
                    newInv.setTotalTransferredOut(0);
                    return newInv;
                });

        destInv.setTotalTransferredIn((destInv.getTotalTransferredIn() != null ? destInv.getTotalTransferredIn() : 0) + req.getQuantity());
        destInv.recalculateBalances();
        inventoryRepository.save(destInv);

        // Audit Log
        String details = String.format("Transferred %d units of '%s' from %s to %s (Transfer #: %s)",
                req.getQuantity(), asset.getName(), sourceBase.getName(), destBase.getName(), trfNum);
        auditLogService.logAction("TRANSFER_COMPLETED", "Transfer", trfNum, details);

        return savedTransfer;
    }

    @Transactional
    public Transfer updateTransferStatus(Long id, TransferStatusUpdateDto dto) {
        Transfer transfer = getTransferById(id);
        TransferStatus oldStatus = transfer.getStatus();
        transfer.setStatus(dto.getStatus());
        if (dto.getStatus() == TransferStatus.COMPLETED && transfer.getCompletedAt() == null) {
            transfer.setCompletedAt(LocalDateTime.now());
        }

        Transfer updated = transferRepository.save(transfer);
        auditLogService.logAction("TRANSFER_STATUS_UPDATED", "Transfer", transfer.getTransferNumber(),
                "Changed status from " + oldStatus + " to " + dto.getStatus());
        return updated;
    }
}
