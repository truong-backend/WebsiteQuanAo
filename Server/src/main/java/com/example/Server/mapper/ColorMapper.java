package com.example.Server.mapper;

import com.example.Server.dto.response.color.ColorResponse;
import com.example.Server.entity.Color;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ColorMapper {
    public static ColorResponse toResponse(Color c) {
        if (c == null) return null;
        ColorResponse r = new ColorResponse();
        r.setCode(c.getCode());
        r.setName(c.getName());
        return r;
    }
    public static List<ColorResponse> toResponses(List<Color> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ColorMapper::toResponse).collect(Collectors.toList());
    }
}
