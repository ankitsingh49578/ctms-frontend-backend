package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateManagerRequest;
import com.ctms.dto.request.UpdateManagerRequest;
import com.ctms.dto.response.ManagerResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for clinical-manager profiles (1:1 with a user account). */
public interface ManagerService {

    ManagerResponse createManager(CreateManagerRequest request) throws CTMSException;
    ManagerResponse updateManager(Integer managerId, UpdateManagerRequest request) throws CTMSException;
    void deleteManager(Integer managerId) throws CTMSException;
    ManagerResponse getManager(Integer managerId) throws CTMSException;
    ManagerResponse getManagerByUser(Integer userId) throws CTMSException;
    Page<ManagerResponse> listManagers(Pageable pageable);
    Page<ManagerResponse> searchManagers(String keyword, Pageable pageable);
    boolean managerExists(Integer managerId);
    long countManagers();
}
