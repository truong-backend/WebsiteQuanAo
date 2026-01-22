package com.example.Server.repository;

import com.example.Server.entity.Category;
import com.example.Server.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SizeRepository extends JpaRepository<Size, String>, JpaSpecificationExecutor<Size> {

    boolean existsByNameAndIdNot(String name, String id);

    boolean existsByName(String name);
}