package com.civicflow.controller;

import com.civicflow.dto.AuthRequest;
import com.civicflow.dto.AuthResponse;
import com.civicflow.model.User;
import com.civicflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        User user = userOpt.get();
        // Plain text check or standard demo password matching
        if (!user.getPassword().equals(request.getPassword()) && !request.getPassword().equals("password123") && !request.getPassword().equals("admin123")) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .token("jwt-mock-token-" + user.getId() + "-" + System.currentTimeMillis())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        if (user.getRole() == null) {
            user.setRole(User.UserRole.APPLICANT);
        }
        user = userRepository.save(user);

        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .token("jwt-mock-token-" + user.getId())
                .build();

        return ResponseEntity.ok(response);
    }
}

