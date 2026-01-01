package com.example.Server.repository;

import com.example.Server.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ColorRepository extends JpaRepository<Color, String> {
  long deleteByCode(String code);
}