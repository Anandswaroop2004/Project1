package com.military.mams.controller;

import com.military.mams.dto.ApiResponse;
import com.military.mams.dto.AuthRequest;
import com.military.mams.dto.AuthResponse;
import com.military.mams.dto.RegisterRequest;
import com.military.mams.entity.User;
import com.military.mams.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.ok("Military Asset Management System API is Operational and Secure."));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", response));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully", user));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        User user = authService.getUserByUsername(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getAllUsers()));
    }
}
