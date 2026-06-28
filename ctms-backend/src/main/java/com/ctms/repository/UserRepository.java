package com.ctms.repository;

import com.ctms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRole_RoleIdOrderByUserId(Integer roleId);

    long countByRole_RoleId(Integer roleId);

    @Query("""
           SELECT u FROM User u
           WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<User> search(@Param("kw") String kw, Pageable pageable);
}
