package com.military.mams.dto;

import com.military.mams.entity.TransferStatus;

public class TransferStatusUpdateDto {
    private TransferStatus status;

    public TransferStatusUpdateDto() {}
    public TransferStatusUpdateDto(TransferStatus status) {
        this.status = status;
    }

    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }
}
