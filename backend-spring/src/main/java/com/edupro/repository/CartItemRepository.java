package com.edupro.repository;

import com.edupro.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, CartItem.CartItemId> {
    List<CartItem> findByUserIdOrderByAddedAtDesc(String userId);
    void deleteByUserId(String userId);
    void deleteByUserIdAndCourseId(String userId, String courseId);
}
