package com.military.mams.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_expenditures")
public class AssetExpenditure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expenditure_code", nullable = false, unique = true, length = 50)
    private String expenditureCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_id", nullable = false)
    private MilitaryBase base;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "expended_date", nullable = false)
    private LocalDateTime expendedDate;

    @Column(name = "mission_or_exercise", nullable = false, length = 150)
    private String missionOrExercise;

    @Column(name = "authorized_officer", nullable = false, length = 100)
    private String authorizedOfficer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recorded_by_user_id")
    private User recordedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AssetExpenditure() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExpenditureCode() { return expenditureCode; }
    public void setExpenditureCode(String expenditureCode) { this.expenditureCode = expenditureCode; }

    public MilitaryBase getBase() { return base; }
    public void setBase(MilitaryBase base) { this.base = base; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getExpendedDate() { return expendedDate; }
    public void setExpendedDate(LocalDateTime expendedDate) { this.expendedDate = expendedDate; }

    public String getMissionOrExercise() { return missionOrExercise; }
    public void setMissionOrExercise(String missionOrExercise) { this.missionOrExercise = missionOrExercise; }

    public String getAuthorizedOfficer() { return authorizedOfficer; }
    public void setAuthorizedOfficer(String authorizedOfficer) { this.authorizedOfficer = authorizedOfficer; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
