package com.military.mams.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_assignments")
public class AssetAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_code", nullable = false, unique = true, length = 50)
    private String assignmentCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_id", nullable = false)
    private MilitaryBase base;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "assigned_to_name", nullable = false, length = 100)
    private String assignedToName;

    @Column(name = "assigned_to_rank", nullable = false, length = 50)
    private String assignedToRank;

    @Column(name = "assigned_to_service_id", nullable = false, length = 50)
    private String assignedToServiceId;

    @Column(name = "unit_or_squadron", nullable = false, length = 100)
    private String unitOrSquadron;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "returned_date")
    private LocalDateTime returnedDate;

    @Column(name = "condition_on_issue", nullable = false, length = 50)
    private String conditionOnIssue = "EXCELLENT";

    @Column(name = "condition_on_return", length = 50)
    private String conditionOnReturn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AssetAssignment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssignmentCode() { return assignmentCode; }
    public void setAssignmentCode(String assignmentCode) { this.assignmentCode = assignmentCode; }

    public MilitaryBase getBase() { return base; }
    public void setBase(MilitaryBase base) { this.base = base; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

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

    public LocalDateTime getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDateTime returnedDate) { this.returnedDate = returnedDate; }

    public String getConditionOnIssue() { return conditionOnIssue; }
    public void setConditionOnIssue(String conditionOnIssue) { this.conditionOnIssue = conditionOnIssue; }

    public String getConditionOnReturn() { return conditionOnReturn; }
    public void setConditionOnReturn(String conditionOnReturn) { this.conditionOnReturn = conditionOnReturn; }

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
