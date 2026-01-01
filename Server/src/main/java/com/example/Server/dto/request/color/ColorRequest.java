package com.example.Server.dto.request.color;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColorRequest {
    private String code;
    private String name;
}