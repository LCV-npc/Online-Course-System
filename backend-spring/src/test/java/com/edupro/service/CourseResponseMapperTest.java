package com.edupro.service;

import com.edupro.entity.Course;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CourseResponseMapperTest {

    @Test
    void publicResponseDoesNotExposeLessonContentOrQuizAnswers() throws Exception {
        Course course = new Course();
        course.setId("course-1");
        course.setChapters(new ObjectMapper().writeValueAsString(List.of(Map.of(
                "id", "chapter-1",
                "title", "Chapter",
                "lessons", List.of(Map.of(
                        "id", "lesson-1",
                        "title", "Lesson",
                        "type", "quiz",
                        "duration", "5:00",
                        "description", "Public description",
                        "videoUrl", "https://example.invalid/private",
                        "questions", List.of(Map.of("correctAnswerIndex", 2))))))));

        Map<String, Object> result = new CourseResponseMapper(new ObjectMapper()).toMap(course, false);
        List<?> chapters = (List<?>) result.get("chapters");
        @SuppressWarnings("unchecked")
        Map<String, Object> chapter = (Map<String, Object>) chapters.get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> lesson = (Map<String, Object>) ((List<?>) chapter.get("lessons")).get(0);

        assertThat(lesson).containsKeys("id", "title", "type", "duration", "description");
        assertThat(lesson).doesNotContainKeys("videoUrl", "questions", "documentContent", "exercisePrompt");
    }
}
