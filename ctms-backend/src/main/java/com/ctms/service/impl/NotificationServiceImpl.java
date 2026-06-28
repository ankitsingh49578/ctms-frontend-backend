package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.response.NotificationResponse;
import com.ctms.entity.Notification;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.mapper.NotificationMapper;
import com.ctms.repository.NotificationRepository;
import com.ctms.repository.UserRepository;
import com.ctms.service.NotificationService;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link NotificationService} implementation. {@link #notify} runs in a
 * {@code REQUIRES_NEW} transaction so that best-effort notifications fired from
 * other business operations are isolated and never roll back the caller.
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationResponse notify(Integer userId, String title, String message) throws CTMSException {
        log.info("Creating notification for user id={}", userId);
        ValidationUtil.requirePositive(userId == null ? 0 : userId, "userId");
        ValidationUtil.requireNonBlank(title, "title");
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: id=" + userId);
        }
        Notification n = new Notification();
        n.setUser(userRepository.getReferenceById(userId));
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);
        Notification saved = notificationRepository.save(n);
        log.info("Notification created id={}", saved.getNotificationId());
        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyRole(String roleName, String title, String message) {
        List<com.ctms.entity.User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && (u.getRole().getRoleName().equalsIgnoreCase(roleName) || ("ROLE_" + u.getRole().getRoleName().toUpperCase().replace(" ", "_")).equals(roleName)))
                .toList();
        for (com.ctms.entity.User u : users) {
            try {
                notify(u.getUserId(), title, message);
            } catch (Exception e) {
                log.warn("Failed to notify user id={}: {}", u.getUserId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> forUser(Integer userId, Pageable pageable) {
        return notificationRepository.findByUser_UserId(userId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> unreadForUser(Integer userId) {
        return notificationRepository.findByUser_UserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream().map(notificationMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public void markRead(Integer notificationId) throws CTMSException {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: id=" + notificationId));
        n.setRead(true);
        notificationRepository.save(n);
        log.info("Notification marked read id={}", notificationId);
    }
}
