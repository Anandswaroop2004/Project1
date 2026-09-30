package com.military.mams.repository;

import com.military.mams.entity.MilitaryBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MilitaryBaseRepository extends JpaRepository<MilitaryBase, Long> {
    Optional<MilitaryBase> findByCode(String code);
}
