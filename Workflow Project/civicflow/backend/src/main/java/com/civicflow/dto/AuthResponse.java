package com.civicflow.dto;

import com.civicflow.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private User.UserRole role;
    private User.DepartmentType department;
    private String token;
}

