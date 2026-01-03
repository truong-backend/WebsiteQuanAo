package com.example.Server.controller;

import com.example.Server.dto.request.productType.ProductTypeRequest;
import com.example.Server.dto.request.size.SizeRequest;
import com.example.Server.entity.ProductType;
import com.example.Server.services.ProductTypeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequestMapping("/ProductType")
@RestController
public class ProductTypeController
{
    private final ProductTypeService productTypeService;

    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    @GetMapping("/all")
    public List<ProductType> getAllSizes() {
        return productTypeService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveSize( ProductTypeRequest productTypeRequest) {
        return productTypeService.Create(productTypeRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateSize( ProductTypeRequest productTypeRequest) {
        return productTypeService.Update(productTypeRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteSize(Long id) {
        return productTypeService.Delete(id);
    }
}
