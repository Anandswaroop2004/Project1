package com.military.mams.dto;

import com.military.mams.entity.Purchase;
import com.military.mams.entity.Transfer;
import java.util.List;

public class NetMovementBreakdownDto {
    private long totalPurchasesCount;
    private long totalTransfersInCount;
    private long totalTransfersOutCount;
    private long netMovementCount; // purchases + transfersIn - transfersOut
    private List<Purchase> purchases;
    private List<Transfer> transfersIn;
    private List<Transfer> transfersOut;

    public NetMovementBreakdownDto() {}

    public long getTotalPurchasesCount() { return totalPurchasesCount; }
    public void setTotalPurchasesCount(long totalPurchasesCount) { this.totalPurchasesCount = totalPurchasesCount; }

    public long getTotalTransfersInCount() { return totalTransfersInCount; }
    public void setTotalTransfersInCount(long totalTransfersInCount) { this.totalTransfersInCount = totalTransfersInCount; }

    public long getTotalTransfersOutCount() { return totalTransfersOutCount; }
    public void setTotalTransfersOutCount(long totalTransfersOutCount) { this.totalTransfersOutCount = totalTransfersOutCount; }

    public long getNetMovementCount() { return netMovementCount; }
    public void setNetMovementCount(long netMovementCount) { this.netMovementCount = netMovementCount; }

    public List<Purchase> getPurchases() { return purchases; }
    public void setPurchases(List<Purchase> purchases) { this.purchases = purchases; }

    public List<Transfer> getTransfersIn() { return transfersIn; }
    public void setTransfersIn(List<Transfer> transfersIn) { this.transfersIn = transfersIn; }

    public List<Transfer> getTransfersOut() { return transfersOut; }
    public void setTransfersOut(List<Transfer> transfersOut) { this.transfersOut = transfersOut; }
}
