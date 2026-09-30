package com.military.mams.dto;

import java.time.LocalDateTime;

public class TransferRequestDto {
    private String transferNumber;
    private Long sourceBaseId;
    private Long destinationBaseId;
    private Long assetId;
    private Integer quantity;
    private LocalDateTime dispatchedAt;
    private String reasonOrMission;

    public TransferRequestDto() {}

    public String getTransferNumber() { return transferNumber; }
    public void setTransferNumber(String transferNumber) { this.transferNumber = transferNumber; }

    public Long getSourceBaseId() { return sourceBaseId; }
    public void setSourceBaseId(Long sourceBaseId) { this.sourceBaseId = sourceBaseId; }

    public Long getDestinationBaseId() { return destinationBaseId; }
    public void setDestinationBaseId(Long destinationBaseId) { this.destinationBaseId = destinationBaseId; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public String getReasonOrMission() { return reasonOrMission; }
    public void setReasonOrMission(String reasonOrMission) { this.reasonOrMission = reasonOrMission; }
}
