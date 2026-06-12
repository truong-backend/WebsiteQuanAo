package com.example.fashionstore.repository.user;

import com.example.fashionstore.module.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /** Chỉ tìm user chưa bị xóa mềm */
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    /** Dùng cho login — giữ tên cũ để không phá AuthService, nhưng lọc deleted */
    default Optional<User> findByEmail(String email) {
        return findByEmailAndDeletedAtIsNull(email);
    }

    boolean existsByEmail(String email);

    /**
     * Lấy danh sách user với filter, mặc định chỉ lấy user chưa bị xóa.
     * Khi includeDeleted = true thì lấy cả user đã xóa mềm (dùng cho admin restore).
     */
    @Query("""
        SELECT u FROM User u
        WHERE (:search  IS NULL OR LOWER(u.name)  LIKE LOWER(CONCAT('%',:search,'%'))
                                OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')))
          AND (:role    IS NULL OR CAST(u.role AS string) = :role)
          AND (:enabled IS NULL OR u.enabled = :enabled)
          AND (:includeDeleted = true OR u.deletedAt IS NULL)
    """)
    Page<User> findAllWithFilters(
            @Param("search")         String  search,
            @Param("role")           String  role,
            @Param("enabled")        Boolean enabled,
            @Param("includeDeleted") boolean includeDeleted,
            Pageable pageable
    );
}