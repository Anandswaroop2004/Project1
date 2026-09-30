package com.military.mams.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transfer_number", nullable = false, unique = true, length = 50)
    private String transferNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_base_id", nullable = false)
    private MilitaryBase sourceBase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_base_id", nullable = false)
    private MilitaryBase destinationBase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransferStatus status = TransferStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "initiated_by_user_id")
    private User initiatedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "received_by_user_id")
    private User receivedBy;

    @Column(name = "dispatched_at", nullable = false)
    private LocalDateTime dispatchedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "reason_or_mission", columnDefinition = "TEXT")
    private String reasonOrMission;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Transfer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransferNumber() { return transferNumber; }
    public void setTransferNumber(String transferNumber) { this.transferNumber = transferNumber; }

    public MilitaryBase getSourceBase() { return sourceBase; }
    public void setSourceBase(MilitaryBase sourceBase) { this.sourceBase = sourceBase; }

    public MilitaryBase getDestinationBase() { return destinationBase; }
    public void setDestinationBase(MilitaryBase destinationBase) { this.destinationBase = destinationBase; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }

    public User getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(User initiatedBy) { this.initiatedBy = initiatedBy; }

    public User getReceivedBy() { return receivedBy; }
    public void setReceivedBy(User receivedBy) { this.receivedBy = receivedBy; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getReasonOrMission() { return reasonOrMission; }
    public void setReasonOrMission(String reasonOrMission) { this.reasonOrMission = reasonOrMission; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
