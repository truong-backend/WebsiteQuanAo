package com.example.Server.repository;


import com.example.Server.entity.TAIKHOAN;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<TAIKHOAN, Integer> {
    Optional<TAIKHOAN> findByEmail(String email); // Use 'email' if that is the correct field for login
}