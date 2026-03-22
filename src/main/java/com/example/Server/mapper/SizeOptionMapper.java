package com.example.Server.mapper;

import com.example.Server.dto.response.size.SizeOptionResponse;
import com.example.Server.entity.Size;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class SizeOptionMapper {
    public static SizeOptionResponse toResponse(Size s) {
        if (s == null) return null;
        SizeOptionResponse r = new SizeOptionResponse();
        r.setSizeId(s.getId());
        r.setSizeName(s.getName());
        return r;
    }
    public static List<SizeOptionResponse> toResponses(List<Size> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(SizeOptionMapper::toResponse).collect(Collectors.toList());
    }
}
