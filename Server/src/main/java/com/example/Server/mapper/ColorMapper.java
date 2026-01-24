package com.example.Server.mapper;

import com.example.Server.dto.response.color.ColorOptionResponse;
import com.example.Server.dto.response.color.ColorResponse;
import com.example.Server.entity.Color;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Color entity and its DTOs
 */
public class ColorMapper {

    /**
     * Convert Color entity to ColorResponse
     */
    public static ColorResponse toResponse(Color color) {
        if (color == null) {
            return null;
        }

        ColorResponse response = new ColorResponse();
        response.setCode(color.getCode());
        response.setName(color.getName());

        return response;
    }

    /**
     * Convert list of Color entities to list of ColorResponse
     */
    public static List<ColorResponse> toResponses(List<Color> colors) {
        if (colors == null) {
            return Collections.emptyList();
        }

        return colors.stream()
                .map(ColorMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static ColorOptionResponse toOptionResponse(Color color) {
        ColorOptionResponse response = new ColorOptionResponse();
        response.setColorCode(color.getCode());
        response.setColorName(color.getName());
        return response;
    }

    public static List<ColorOptionResponse> toOptionResponseList(List<Color> colors) {
        return colors.stream()
                .map(ColorMapper::toOptionResponse)
                .collect(Collectors.toList());
    }
}
