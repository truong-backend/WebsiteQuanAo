package com.example.Server.services;

import com.example.Server.dto.request.productType.ProductTypeRequest;
import com.example.Server.dto.request.productVariant.ProductVariantRequest;
import com.example.Server.entity.ProductType;
import com.example.Server.entity.ProductVariant;

import com.example.Server.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductVariantService {
    private final ProductVariantRepository productVariantRepository;


    public ProductVariantService(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    public List<ProductVariant> findAll() {
        return productVariantRepository.findAll();
    }

    public Boolean Create(ProductVariantRequest productVariantRequest) {
        if (!productVariantRepository.existsById(productVariantRequest.getId())) {
            ProductVariant productVariant = new ProductVariant();
            productVariant.setId(productVariantRequest.getId());
            productVariant.setQuantity(productVariantRequest.getQuantity());
            productVariant.setImg(productVariantRequest.getImg());

            productVariantRepository.save(productVariant);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( ProductVariantRequest productVariantRequest) {
        if (productVariantRepository.existsById(productVariantRequest.getId())) {
            Optional<ProductVariant> order = productVariantRepository.findById(productVariantRequest.getId());
            order.get().setId(productVariantRequest.getId());
            order.get().setQuantity(productVariantRequest.getQuantity());
            order.get().setImg(productVariantRequest.getImg());

            productVariantRepository.save(order.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (productVariantRepository.existsById(id)) {
            productVariantRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
