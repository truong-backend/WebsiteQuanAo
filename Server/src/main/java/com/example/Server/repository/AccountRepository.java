package com.example.Server.repository;

import com.example.Server.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer>, JpaSpecificationExecutor<Account> {
    
    Optional<Account> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmailAndIdNot(String email, Integer id);
}
