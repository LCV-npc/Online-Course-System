package com.edupro.service;

import com.edupro.entity.Course;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CourseResponseMapper {

    private final ObjectMapper objectMapper;

    public Map<String, Object> toMap(Course course, boolean includeRestrictedContent) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", course.getId());
        result.put("title", course.getTitle());
        result.put("description", text(course.getDescription()));
        result.put("shortDesc", text(course.getShortDesc()));
        result.put("instructorId", course.getInstructorId());
        result.put("price", course.getPrice());
        result.put("discountPrice", course.getDiscountPrice());
        result.put("thumbnail", text(course.getThumbnail()));
        result.put("category", course.getCategory());
        result.put("level", course.getLevel());
        result.put("duration", text(course.getDuration()));
        result.put("totalLessons", course.getTotalLessons() != null ? course.getTotalLessons() : 0);
        result.put("rating", course.getRating() != null ? course.getRating() : 0);
        result.put("totalStudents", course.getTotalStudents() != null ? course.getTotalStudents() : 0);
        result.put("language", text(course.getLanguage()));
        result.put("certificate", course.getCertificate());
        result.put("lastUpdated", course.getLastUpdated() != null ? course.getLastUpdated().toString() : null);
        result.put("tags", parseList(course.getTags()));
        result.put("chapters", includeRestrictedContent
                ? parseList(course.getChapters())
                : publicCurriculum(course.getChapters()));
        result.put("reviews", parseList(course.getReviews()));
        result.put("requirements", parseList(course.getRequirements()));
        result.put("objectives", parseList(course.getObjectives()));
        return result;
    }

    public List<Map<String, Object>> parseObjectList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private List<?> parseList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> publicCurriculum(String chaptersJson) {
        List<Map<String, Object>> chapters = parseObjectList(chaptersJson);
        return chapters.stream().map(chapter -> {
            Map<String, Object> safeChapter = new LinkedHashMap<>();
            copyIfPresent(chapter, safeChapter, "id");
            copyIfPresent(chapter, safeChapter, "title");

            List<Map<String, Object>> safeLessons = new ArrayList<>();
            Object lessonsValue = chapter.get("lessons");
            if (lessonsValue instanceof List<?> lessons) {
                for (Object lessonValue : lessons) {
                    if (!(lessonValue instanceof Map<?, ?> lesson)) continue;
                    Map<String, Object> safeLesson = new LinkedHashMap<>();
                    copyIfPresent(lesson, safeLesson, "id");
                    copyIfPresent(lesson, safeLesson, "title");
                    copyIfPresent(lesson, safeLesson, "type");
                    copyIfPresent(lesson, safeLesson, "duration");
                    copyIfPresent(lesson, safeLesson, "description");
                    safeLessons.add(safeLesson);
                }
            }
            safeChapter.put("lessons", safeLessons);
            return safeChapter;
        }).toList();
    }

    private void copyIfPresent(Map<?, ?> source, Map<String, Object> target, String key) {
        if (source.containsKey(key)) target.put(key, source.get(key));
    }

    private String text(String value) {
        return value != null ? value : "";
    }
}
