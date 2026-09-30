package com.military.mams.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssignmentRequestDto {
    private String assignmentCode;
    private Long baseId;
    private Long assetId;
    private String assignedToName;
    private String assignedToRank;
    private String assignedToServiceId;
    private String unitOrSquadron;
    private Integer quantity = 1;
    private LocalDateTime assignedDate;
    private LocalDate expectedReturnDate;
    private String conditionOnIssue;
    private String notes;

    public AssignmentRequestDto() {}

    public String getAssignmentCode() { return assignmentCode; }
    public void setAssignmentCode(String assignmentCode) { this.assignmentCode = assignmentCode; }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public String getAssignedToRank() { return assignedToRank; }
    public void setAssignedToRank(String assignedToRank) { this.assignedToRank = assignedToRank; }

    public String getAssignedToServiceId() { return assignedToServiceId; }
    public void setAssignedToServiceId(String assignedToServiceId) { this.assignedToServiceId = assignedToServiceId; }

    public String getUnitOrSquadron() { return unitOrSquadron; }
    public void setUnitOrSquadron(String unitOrSquadron) { this.unitOrSquadron = unitOrSquadron; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public LocalDate getExpectedReturnDate() { return expectedReturnDate; }
    public void setExpectedReturnDate(LocalDate expectedReturnDate) { this.expectedReturnDate = expectedReturnDate; }

    public String getConditionOnIssue() { return conditionOnIssue; }
    public void setConditionOnIssue(String conditionOnIssue) { this.conditionOnIssue = conditionOnIssue; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
