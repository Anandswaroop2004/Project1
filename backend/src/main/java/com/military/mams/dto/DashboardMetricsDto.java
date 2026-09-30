package com.military.mams.dto;

import java.math.BigDecimal;

public class DashboardMetricsDto {
    private long openingBalance;
    private long closingBalance;
    private long netMovement; // Purchases + Transfers In - Transfers Out
    private long totalPurchases;
    private long totalTransfersIn;
    private long totalTransfersOut;
    private long assignedAssets;
    private long expendedAssets;
    private long currentAvailableBalance;
    private BigDecimal totalInventoryValue = BigDecimal.ZERO;
    private BigDecimal totalPurchasesCost = BigDecimal.ZERO;
    private long activeBasesCount;
    private long totalCatalogAssetsCount;

    public DashboardMetricsDto() {}

    public long getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(long openingBalance) { this.openingBalance = openingBalance; }

    public long getClosingBalance() { return closingBalance; }
    public void setClosingBalance(long closingBalance) { this.closingBalance = closingBalance; }

    public long getNetMovement() { return netMovement; }
    public void setNetMovement(long netMovement) { this.netMovement = netMovement; }

    public long getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(long totalPurchases) { this.totalPurchases = totalPurchases; }

    public long getTotalTransfersIn() { return totalTransfersIn; }
    public void setTotalTransfersIn(long totalTransfersIn) { this.totalTransfersIn = totalTransfersIn; }

    public long getTotalTransfersOut() { return totalTransfersOut; }
    public void setTotalTransfersOut(long totalTransfersOut) { this.totalTransfersOut = totalTransfersOut; }

    public long getAssignedAssets() { return assignedAssets; }
    public void setAssignedAssets(long assignedAssets) { this.assignedAssets = assignedAssets; }

    public long getExpendedAssets() { return expendedAssets; }
    public void setExpendedAssets(long expendedAssets) { this.expendedAssets = expendedAssets; }

    public long getCurrentAvailableBalance() { return currentAvailableBalance; }
    public void setCurrentAvailableBalance(long currentAvailableBalance) { this.currentAvailableBalance = currentAvailableBalance; }

    public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
    public void setTotalInventoryValue(BigDecimal totalInventoryValue) { this.totalInventoryValue = totalInventoryValue; }

    public BigDecimal getTotalPurchasesCost() { return totalPurchasesCost; }
    public void setTotalPurchasesCost(BigDecimal totalPurchasesCost) { this.totalPurchasesCost = totalPurchasesCost; }

    public long getActiveBasesCount() { return activeBasesCount; }
    public void setActiveBasesCount(long activeBasesCount) { this.activeBasesCount = activeBasesCount; }

    public long getTotalCatalogAssetsCount() { return totalCatalogAssetsCount; }
    public void setTotalCatalogAssetsCount(long totalCatalogAssetsCount) { this.totalCatalogAssetsCount = totalCatalogAssetsCount; }
}
