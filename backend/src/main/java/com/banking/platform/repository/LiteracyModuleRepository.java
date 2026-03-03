package com.banking.platform.repository;

import com.banking.platform.entity.LiteracyModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LiteracyModuleRepository extends JpaRepository<LiteracyModule, Long> {

    List<LiteracyModule> findByCategory(String category);
}
