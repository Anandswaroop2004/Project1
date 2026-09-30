package com.military.mams.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "base_inventories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"base_id", "asset_id"})
})
public class BaseInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_id", nullable = false)
    private MilitaryBase base;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "opening_balance", nullable = false)
    private Integer openingBalance = 0;

    @Column(name = "current_balance", nullable = false)
    private Integer currentBalance = 0;

    @Column(name = "assigned_quantity", nullable = false)
    private Integer assignedQuantity = 0;

    @Column(name = "expended_quantity", nullable = false)
    private Integer expendedQuantity = 0;

    @Column(name = "total_purchased", nullable = false)
    private Integer totalPurchased = 0;

    @Column(name = "total_transferred_in", nullable = false)
    private Integer totalTransferredIn = 0;

    @Column(name = "total_transferred_out", nullable = false)
    private Integer totalTransferredOut = 0;

    @Column(name = "closing_balance", nullable = false)
    private Integer closingBalance = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public BaseInventory() {}

    public void recalculateBalances() {
        int netMovement = (totalPurchased != null ? totalPurchased : 0)
                        + (totalTransferredIn != null ? totalTransferredIn : 0)
                        - (totalTransferredOut != null ? totalTransferredOut : 0);
        int op = openingBalance != null ? openingBalance : 0;
        int exp = expendedQuantity != null ? expendedQuantity : 0;
        int asg = assignedQuantity != null ? assignedQuantity : 0;

        this.closingBalance = op + netMovement - exp;
        this.currentBalance = Math.max(0, this.closingBalance - asg);
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MilitaryBase getBase() { return base; }
    public void setBase(MilitaryBase base) { this.base = base; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Integer getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(Integer openingBalance) { this.openingBalance = openingBalance; }

    public Integer getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Integer currentBalance) { this.currentBalance = currentBalance; }

    public Integer getAssignedQuantity() { return assignedQuantity; }
    public void setAssignedQuantity(Integer assignedQuantity) { this.assignedQuantity = assignedQuantity; }

    public Integer getExpendedQuantity() { return expendedQuantity; }
    public void setExpendedQuantity(Integer expendedQuantity) { this.expendedQuantity = expendedQuantity; }

    public Integer getTotalPurchased() { return totalPurchased; }
    public void setTotalPurchased(Integer totalPurchased) { this.totalPurchased = totalPurchased; }

    public Integer getTotalTransferredIn() { return totalTransferredIn; }
    public void setTotalTransferredIn(Integer totalTransferredIn) { this.totalTransferredIn = totalTransferredIn; }

    public Integer getTotalTransferredOut() { return totalTransferredOut; }
    public void setTotalTransferredOut(Integer totalTransferredOut) { this.totalTransferredOut = totalTransferredOut; }

    public Integer getClosingBalance() { return closingBalance; }
    public void setClosingBalance(Integer closingBalance) { this.closingBalance = closingBalance; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
