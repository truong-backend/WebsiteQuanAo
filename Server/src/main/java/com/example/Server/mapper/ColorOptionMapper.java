package com.example.Server.mapper;

import com.example.Server.dto.response.color.ColorOptionResponse;
import com.example.Server.entity.Color;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ColorOptionMapper {
    public static ColorOptionResponse toResponse(Color c) {
        if (c == null) return null;
        ColorOptionResponse r = new ColorOptionResponse();
        r.setColorCode(c.getCode());
        r.setColorName(c.getName());
        return r;
    }
    public static List<ColorOptionResponse> toResponses(List<Color> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ColorOptionMapper::toResponse).collect(Collectors.toList());
    }
}
