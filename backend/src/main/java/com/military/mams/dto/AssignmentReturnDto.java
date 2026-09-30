package com.military.mams.dto;

import com.military.mams.entity.AssignmentStatus;
import java.time.LocalDateTime;

public class AssignmentReturnDto {
    private LocalDateTime returnedDate;
    private String conditionOnReturn;
    private AssignmentStatus status = AssignmentStatus.RETURNED;
    private String notes;

    public AssignmentReturnDto() {}

    public LocalDateTime getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDateTime returnedDate) { this.returnedDate = returnedDate; }

    public String getConditionOnReturn() { return conditionOnReturn; }
    public void setConditionOnReturn(String conditionOnReturn) { this.conditionOnReturn = conditionOnReturn; }

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
