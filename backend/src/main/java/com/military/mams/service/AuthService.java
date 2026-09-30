package com.military.mams.service;

import com.military.mams.config.JwtUtils;
import com.military.mams.dto.AuthRequest;
import com.military.mams.dto.AuthResponse;
import com.military.mams.dto.RegisterRequest;
import com.military.mams.entity.MilitaryBase;
import com.military.mams.entity.Role;
import com.military.mams.entity.User;
import com.military.mams.repository.MilitaryBaseRepository;
import com.military.mams.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final MilitaryBaseRepository baseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    public AuthService(UserRepository userRepository,
                       MilitaryBaseRepository baseRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       AuthenticationManager authenticationManager,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.baseRepository = baseRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.auditLogService = auditLogService;
    }

    public AuthResponse login(AuthRequest request) {
        // Authenticate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername()));

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("fullName", user.getFullName());
        claims.put("rank", user.getMilitaryRank());
        if (user.getBase() != null) {
            claims.put("baseId", user.getBase().getId());
            claims.put("baseName", user.getBase().getName());
        }

        String token = jwtUtils.generateToken(user.getUsername(), claims);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setMilitaryRank(user.getMilitaryRank());
        response.setServiceNumber(user.getServiceNumber());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        if (user.getBase() != null) {
            response.setBaseId(user.getBase().getId());
            response.setBaseName(user.getBase().getName());
            response.setBaseCode(user.getBase().getCode());
        }

        auditLogService.logAction("LOGIN_SUCCESS", "User", user.getUsername(), "User logged into system successfully.");
        return response;
    }

    @Transactional
    public User register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username '" + req.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email '" + req.getEmail() + "' is already registered.");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setMilitaryRank(req.getMilitaryRank() != null ? req.getMilitaryRank() : "Officer");
        user.setServiceNumber(req.getServiceNumber() != null ? req.getServiceNumber() : "MIL-" + System.currentTimeMillis());
        user.setEmail(req.getEmail());
        user.setRole(req.getRole() != null ? req.getRole() : Role.LOGISTICS_OFFICER);

        if (req.getBaseId() != null) {
            MilitaryBase base = baseRepository.findById(req.getBaseId())
                    .orElseThrow(() -> new RuntimeException("Base not found: " + req.getBaseId()));
            user.setBase(base);
        }

        User saved = userRepository.save(user);
        auditLogService.logAction("USER_CREATED", "User", saved.getUsername(), "Registered new user with role: " + saved.getRole());
        return saved;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
