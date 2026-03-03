package com.banking.platform.service;

import com.banking.platform.entity.LiteracyModule;
import com.banking.platform.exception.ResourceNotFoundException;
import com.banking.platform.repository.LiteracyModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Manages financial literacy learning modules.
 * Admins can create / delete modules; users can browse them.
 */
@Service
@RequiredArgsConstructor
public class LiteracyModuleService {

    private final LiteracyModuleRepository repository;

    @Transactional(readOnly = true)
    public List<LiteracyModule> getAllModules() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LiteracyModule> getByCategory(String category) {
        return repository.findByCategory(category.toUpperCase());
    }

    @Transactional(readOnly = true)
    public LiteracyModule getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Literacy module not found"));
    }

    @Transactional
    public LiteracyModule create(LiteracyModule module) {
        module.setCategory(module.getCategory().toUpperCase());
        return repository.save(module);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Literacy module not found");
        }
        repository.deleteById(id);
    }
}
