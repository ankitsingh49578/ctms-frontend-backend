package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.ChangePasswordRequest;
import com.ctms.dto.request.CreateUserRequest;
import com.ctms.dto.request.UpdateUserRequest;
import com.ctms.dto.response.UserResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for user account and role administration. */
public interface UserService {
    UserResponse createUser(CreateUserRequest request) throws CTMSException;
    UserResponse updateUser(Integer userId, UpdateUserRequest request) throws CTMSException;
    void changeRole(Integer userId, Integer roleId) throws CTMSException;
    void changePassword(Integer userId, ChangePasswordRequest request) throws CTMSException;
    void enableUser(Integer userId) throws CTMSException;
    void disableUser(Integer userId) throws CTMSException;
    void deleteUser(Integer userId) throws CTMSException;
    UserResponse getUser(Integer userId) throws CTMSException;
    Page<UserResponse> listUsers(Pageable pageable);
    Page<UserResponse> searchUsers(String keyword, Pageable pageable);
    long countUsers();
}
