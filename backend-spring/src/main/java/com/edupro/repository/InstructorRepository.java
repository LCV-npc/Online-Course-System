package com.edupro.repository;

import com.edupro.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InstructorRepository extends JpaRepository<Instructor, String> {
    List<Instructor> findAllByOrderByNameAsc();
}
