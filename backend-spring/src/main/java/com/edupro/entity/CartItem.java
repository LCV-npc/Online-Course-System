package com.edupro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CartItem.CartItemId.class)
public class CartItem {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Id
    @Column(name = "course_id", length = 64)
    private String courseId;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemId implements Serializable {
        private String userId;
        private String courseId;
    }
}
