package com.example.Server.controller;

import com.example.Server.dto.request.productVariant.ProductVariantRequest;
//import com.example.Server.dto.request.ProductVariant.ProductVariantRequest;
import com.example.Server.entity.ProductVariant;
import com.example.Server.entity.ProductVariant;
import com.example.Server.services.ProductVariantService;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/ProductVariant")
@RestController
public class ProductVariantController {
    private final ProductVariantService productVariantService;

    public ProductVariantController(ProductVariantService productVariantService) {
        this.productVariantService = productVariantService;
    }

    @GetMapping("/all")
    public List<ProductVariant> getAllProductVariants() {
        return productVariantService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveProductVariant( ProductVariantRequest productVariantRequest) {
        return productVariantService.Create(productVariantRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateProductVariant( ProductVariantRequest productVariantRequest) {
        return productVariantService.Update(productVariantRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteProductVariant(String id) {
        return productVariantService.Delete(id);
    }
}
