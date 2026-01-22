package com.example.Server.dto.response.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private Double price;
    private String path;
    private String img;
    private String hoverImg;
    private Long productTypeId;
}
