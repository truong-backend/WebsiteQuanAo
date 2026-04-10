package com.example.fashionstore.repository.user;

import com.example.fashionstore.module.user.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByDefaultAddressDescCreatedAtDesc(Integer userId);

    Optional<UserAddress> findByUserIdAndDefaultAddressTrue(Integer userId);

    /** Bỏ default của tất cả địa chỉ user để set 1 cái mới làm default */
    @Modifying
    @Query("UPDATE UserAddress a SET a.defaultAddress = false WHERE a.user.id = :userId")
    void clearDefaultByUserId(@Param("userId") Integer userId);

    long countByUserId(Integer userId);
}