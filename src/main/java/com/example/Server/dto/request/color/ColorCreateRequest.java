package com.example.Server.dto.request.color;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ColorCreateRequest {
    private String code;
    private String name;
}
