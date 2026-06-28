package com.ctms.entity;

import com.ctms.enums.UserStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

/**
 * roles table. A role groups a set of {@link Permission}s and is referenced by
 * {@link User#getRole()}. The roles <-> permissions junction (role_permissions)
 * is mapped implicitly with {@link ManyToMany} + {@link JoinTable}, so no
 * explicit RolePermission entity is required.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // maps SERIAL
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 10)
    private UserStatus status = UserStatus.ACTIVE;        // converter -> 'Active'/'Inactive'

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<Permission> permissions = new HashSet<>();
}
