package com.military.mams.service;

import com.military.mams.dto.DashboardMetricsDto;
import com.military.mams.dto.NetMovementBreakdownDto;
import com.military.mams.entity.*;
import com.military.mams.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    private final BaseInventoryRepository inventoryRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransferRepository transferRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final AssetExpenditureRepository expenditureRepository;
    private final MilitaryBaseRepository baseRepository;
    private final AssetRepository assetRepository;

    public DashboardService(BaseInventoryRepository inventoryRepository,
                            PurchaseRepository purchaseRepository,
                            TransferRepository transferRepository,
                            AssetAssignmentRepository assignmentRepository,
                            AssetExpenditureRepository expenditureRepository,
                            MilitaryBaseRepository baseRepository,
                            AssetRepository assetRepository) {
        this.inventoryRepository = inventoryRepository;
        this.purchaseRepository = purchaseRepository;
        this.transferRepository = transferRepository;
        this.assignmentRepository = assignmentRepository;
        this.expenditureRepository = expenditureRepository;
        this.baseRepository = baseRepository;
        this.assetRepository = assetRepository;
    }

    public DashboardMetricsDto getMetrics(Long baseId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        List<BaseInventory> inventories = inventoryRepository.findWithFilters(baseId, categoryId);
        List<Purchase> purchases = purchaseRepository.findWithFilters(baseId, categoryId, startDate, endDate);
        List<Transfer> transfersIn = transferRepository.findTransfersInWithFilters(baseId, categoryId, startDate, endDate);
        List<Transfer> transfersOut = transferRepository.findTransfersOutWithFilters(baseId, categoryId, startDate, endDate);
        List<AssetAssignment> assignments = assignmentRepository.findWithFilters(baseId, categoryId, AssignmentStatus.ACTIVE, startDate, endDate);
        List<AssetExpenditure> expenditures = expenditureRepository.findWithFilters(baseId, categoryId, startDate, endDate);

        long openingBal = 0;
        BigDecimal totalValue = BigDecimal.ZERO;

        for (BaseInventory inv : inventories) {
            openingBal += (inv.getOpeningBalance() != null ? inv.getOpeningBalance() : 0);
            if (inv.getAsset() != null && inv.getAsset().getUnitPrice() != null) {
                BigDecimal unitPrice = inv.getAsset().getUnitPrice();
                int closing = inv.getClosingBalance() != null ? inv.getClosingBalance() : 0;
                totalValue = totalValue.add(unitPrice.multiply(BigDecimal.valueOf(closing)));
            }
        }

        long totalPurchasesQty = 0;
        BigDecimal totalPurchasesCost = BigDecimal.ZERO;
        for (Purchase p : purchases) {
            totalPurchasesQty += (p.getQuantity() != null ? p.getQuantity() : 0);
            if (p.getTotalCost() != null) {
                totalPurchasesCost = totalPurchasesCost.add(p.getTotalCost());
            }
        }

        long totalTransfersInQty = 0;
        for (Transfer t : transfersIn) {
            totalTransfersInQty += (t.getQuantity() != null ? t.getQuantity() : 0);
        }

        long totalTransfersOutQty = 0;
        for (Transfer t : transfersOut) {
            totalTransfersOutQty += (t.getQuantity() != null ? t.getQuantity() : 0);
        }

        long assignedQty = 0;
        for (AssetAssignment a : assignments) {
            assignedQty += (a.getQuantity() != null ? a.getQuantity() : 0);
        }

        long expendedQty = 0;
        for (AssetExpenditure e : expenditures) {
            expendedQty += (e.getQuantity() != null ? e.getQuantity() : 0);
        }

        // Core Formula: Net Movement = Purchases + Transfers In - Transfers Out
        long netMovement = totalPurchasesQty + totalTransfersInQty - totalTransfersOutQty;
        // Closing Balance = Opening Balance + Net Movement - Expended Assets
        long closingBal = openingBal + netMovement - expendedQty;
        long currentAvailable = Math.max(0, closingBal - assignedQty);

        DashboardMetricsDto dto = new DashboardMetricsDto();
        dto.setOpeningBalance(openingBal);
        dto.setClosingBalance(closingBal);
        dto.setNetMovement(netMovement);
        dto.setTotalPurchases(totalPurchasesQty);
        dto.setTotalTransfersIn(totalTransfersInQty);
        dto.setTotalTransfersOut(totalTransfersOutQty);
        dto.setAssignedAssets(assignedQty);
        dto.setExpendedAssets(expendedQty);
        dto.setCurrentAvailableBalance(currentAvailable);
        dto.setTotalInventoryValue(totalValue);
        dto.setTotalPurchasesCost(totalPurchasesCost);
        dto.setActiveBasesCount(baseRepository.count());
        dto.setTotalCatalogAssetsCount(assetRepository.count());

        return dto;
    }

    public NetMovementBreakdownDto getNetMovementBreakdown(Long baseId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Purchase> purchases = purchaseRepository.findWithFilters(baseId, categoryId, startDate, endDate);
        List<Transfer> transfersIn = transferRepository.findTransfersInWithFilters(baseId, categoryId, startDate, endDate);
        List<Transfer> transfersOut = transferRepository.findTransfersOutWithFilters(baseId, categoryId, startDate, endDate);

        long purchasesQty = purchases.stream().mapToLong(p -> p.getQuantity() != null ? p.getQuantity() : 0).sum();
        long inQty = transfersIn.stream().mapToLong(t -> t.getQuantity() != null ? t.getQuantity() : 0).sum();
        long outQty = transfersOut.stream().mapToLong(t -> t.getQuantity() != null ? t.getQuantity() : 0).sum();
        long net = purchasesQty + inQty - outQty;

        NetMovementBreakdownDto dto = new NetMovementBreakdownDto();
        dto.setPurchases(purchases);
        dto.setTransfersIn(transfersIn);
        dto.setTransfersOut(transfersOut);
        dto.setTotalPurchasesCount(purchasesQty);
        dto.setTotalTransfersInCount(inQty);
        dto.setTotalTransfersOutCount(outQty);
        dto.setNetMovementCount(net);

        return dto;
    }

    public List<Map<String, Object>> getCategorySummary(Long baseId) {
        List<BaseInventory> list = (baseId != null) ? inventoryRepository.findByBaseId(baseId) : inventoryRepository.findAll();
        Map<String, Map<String, Long>> catMap = new HashMap<>();

        for (BaseInventory inv : list) {
            String catName = (inv.getAsset() != null && inv.getAsset().getCategory() != null)
                    ? inv.getAsset().getCategory().getName() : "Uncategorized";

            catMap.putIfAbsent(catName, new HashMap<>());
            Map<String, Long> stat = catMap.get(catName);

            stat.put("opening", stat.getOrDefault("opening", 0L) + (inv.getOpeningBalance() != null ? inv.getOpeningBalance() : 0));
            stat.put("purchases", stat.getOrDefault("purchases", 0L) + (inv.getTotalPurchased() != null ? inv.getTotalPurchased() : 0));
            stat.put("transfersIn", stat.getOrDefault("transfersIn", 0L) + (inv.getTotalTransferredIn() != null ? inv.getTotalTransferredIn() : 0));
            stat.put("transfersOut", stat.getOrDefault("transfersOut", 0L) + (inv.getTotalTransferredOut() != null ? inv.getTotalTransferredOut() : 0));
            stat.put("assigned", stat.getOrDefault("assigned", 0L) + (inv.getAssignedQuantity() != null ? inv.getAssignedQuantity() : 0));
            stat.put("expended", stat.getOrDefault("expended", 0L) + (inv.getExpendedQuantity() != null ? inv.getExpendedQuantity() : 0));
            stat.put("closing", stat.getOrDefault("closing", 0L) + (inv.getClosingBalance() != null ? inv.getClosingBalance() : 0));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : catMap.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", entry.getKey());
            item.putAll(entry.getValue());
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getBaseDistribution(Long categoryId) {
        List<BaseInventory> list = inventoryRepository.findWithFilters(null, categoryId);
        Map<String, Long> baseMap = new HashMap<>();

        for (BaseInventory inv : list) {
            String baseName = (inv.getBase() != null) ? inv.getBase().getName() : "Unknown Base";
            baseMap.put(baseName, baseMap.getOrDefault(baseName, 0L) + (inv.getClosingBalance() != null ? inv.getClosingBalance() : 0));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : baseMap.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("baseName", entry.getKey());
            item.put("totalAssets", entry.getValue());
            result.add(item);
        }
        return result;
    }
}
