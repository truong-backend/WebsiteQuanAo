package com.example.fashionstore.dto.color;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ColorDto {
    private Long          id;
    private String        code;
    private String        name;
    private String        nameEn;
    private boolean       active;
    private LocalDateTime createdAt;
}