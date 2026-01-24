package com.example.Server.mapper;

import com.example.Server.dto.response.size.SizeOptionResponse;
import com.example.Server.dto.response.size.SizeResponse;
import com.example.Server.entity.Size;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Size entity and its DTOs
 */
public class SizeMapper {

    /**
     * Convert Size entity to SizeResponse
     */
    public static SizeResponse toResponse(Size size) {
        if (size == null) {
            return null;
        }

        SizeResponse response = new SizeResponse();
        response.setId(size.getId());
        response.setName(size.getName());

        return response;
    }

    /**
     * Convert list of Size entities to list of SizeResponse
     */
    public static List<SizeResponse> toResponses(List<Size> sizes) {
        if (sizes == null) {
            return Collections.emptyList();
        }

        return sizes.stream()
                .map(SizeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static SizeOptionResponse toOptionResponse(Size size) {
        SizeOptionResponse response = new SizeOptionResponse();
        response.setSizeId(size.getId());
        response.setSizeName(size.getName());
        return response;
    }

    public static List<SizeOptionResponse> toOptionResponseList(List<Size> sizes) {
        return sizes.stream()
                .map(SizeMapper::toOptionResponse)
                .collect(Collectors.toList());
    }
}
