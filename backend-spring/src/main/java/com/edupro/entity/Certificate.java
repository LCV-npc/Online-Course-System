package com.edupro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "certificates",
    uniqueConstraints = @UniqueConstraint(name = "uq_cert", columnNames = {"user_id","course_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "course_id", nullable = false, length = 64)
    private String courseId;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;
}
