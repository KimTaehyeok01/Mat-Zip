package com.Mat_Zip.Mat_Zip.domain.restaurant.repository;

import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
