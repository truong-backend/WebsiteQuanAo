package com.example.fashionstore.dto.size;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SizeDto {
    private Long          id;
    private String        code;
    private String        name;
    private Integer       sortOrder;
    private boolean       active;
    private LocalDateTime createdAt;

    private boolean       deleted;
    private LocalDateTime deletedAt;
}