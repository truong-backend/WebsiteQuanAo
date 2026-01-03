package com.example.Server.controller;


import com.example.Server.dto.request.product.ProductRequest;

import com.example.Server.entity.Product;

import com.example.Server.services.ProductService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Product")
@RestController
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveProduct( ProductRequest productRequest) {
        return productService.Create(productRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateProduct( ProductRequest productRequest) {
        return productService.Update(productRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteProduct(String id) {
        return productService.Delete(id);
    }
}
