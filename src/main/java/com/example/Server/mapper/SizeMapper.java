package com.example.Server.mapper;

import com.example.Server.dto.response.size.SizeResponse;
import com.example.Server.entity.Size;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class SizeMapper {
    public static SizeResponse toResponse(Size s) {
        if (s == null) return null;
        SizeResponse r = new SizeResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        return r;
    }
    public static List<SizeResponse> toResponses(List<Size> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(SizeMapper::toResponse).collect(Collectors.toList());
    }
}
