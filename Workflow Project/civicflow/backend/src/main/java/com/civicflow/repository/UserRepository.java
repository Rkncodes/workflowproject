package com.civicflow.repository;

import com.civicflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.UserRole role);
    List<User> findByDepartment(User.DepartmentType department);
}

