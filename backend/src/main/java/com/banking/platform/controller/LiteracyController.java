package com.banking.platform.controller;

import com.banking.platform.entity.LiteracyModule;
import com.banking.platform.service.LiteracyModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Financial Literacy module endpoints.
 * GET endpoints are public; POST/DELETE require ADMIN role.
 */
@RestController
@RequestMapping("/api/literacy")
@RequiredArgsConstructor
public class LiteracyController {

    private final LiteracyModuleService literacyModuleService;

    @GetMapping
    public ResponseEntity<List<LiteracyModule>> getAll() {
        return ResponseEntity.ok(literacyModuleService.getAllModules());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<LiteracyModule>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(literacyModuleService.getByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiteracyModule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(literacyModuleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<LiteracyModule> create(@Valid @RequestBody LiteracyModule module) {
        LiteracyModule created = literacyModuleService.create(module);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        literacyModuleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
