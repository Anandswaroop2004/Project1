package com.military.mams.service;

import com.military.mams.entity.MilitaryBase;
import com.military.mams.repository.MilitaryBaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MilitaryBaseService {

    private final MilitaryBaseRepository baseRepository;

    public MilitaryBaseService(MilitaryBaseRepository baseRepository) {
        this.baseRepository = baseRepository;
    }

    public List<MilitaryBase> getAllBases() {
        return baseRepository.findAll();
    }

    public MilitaryBase getBaseById(Long id) {
        return baseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Military base not found with ID: " + id));
    }
}
