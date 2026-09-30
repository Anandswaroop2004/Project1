package com.military.mams.dto;

import java.time.LocalDateTime;

public class ExpenditureRequestDto {
    private String expenditureCode;
    private Long baseId;
    private Long assetId;
    private Integer quantity;
    private LocalDateTime expendedDate;
    private String missionOrExercise;
    private String authorizedOfficer;
    private String remarks;

    public ExpenditureRequestDto() {}

    public String getExpenditureCode() { return expenditureCode; }
    public void setExpenditureCode(String expenditureCode) { this.expenditureCode = expenditureCode; }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getExpendedDate() { return expendedDate; }
    public void setExpendedDate(LocalDateTime expendedDate) { this.expendedDate = expendedDate; }

    public String getMissionOrExercise() { return missionOrExercise; }
    public void setMissionOrExercise(String missionOrExercise) { this.missionOrExercise = missionOrExercise; }

    public String getAuthorizedOfficer() { return authorizedOfficer; }
    public void setAuthorizedOfficer(String authorizedOfficer) { this.authorizedOfficer = authorizedOfficer; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
