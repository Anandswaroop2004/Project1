package com.military.mams.service;

import com.military.mams.entity.AuditLog;
import com.military.mams.entity.User;
import com.military.mams.repository.AuditLogRepository;
import com.military.mams.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void logAction(String action, String entityName, String entityId, String details) {
        String username = "ANONYMOUS";
        String role = "SYSTEM";
        Long userId = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                userId = user.getId();
                role = user.getRole().name();
            }
        }

        AuditLog log = new AuditLog(userId, username, role, action, entityName, entityId, details, "127.0.0.1");
        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
