package com.example.Server.services;

import com.example.Server.dto.request.product.ProductRequest;
import com.example.Server.dto.request.productType.ProductTypeRequest;
import com.example.Server.entity.Product;
import com.example.Server.entity.ProductType;
import com.example.Server.repository.ProductTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductTypeService {
    private final ProductTypeRepository productTypeRepository;


    public ProductTypeService(ProductTypeRepository productTypeRepository) {
        this.productTypeRepository = productTypeRepository;
    }

    public List<ProductType> findAll() {
        return productTypeRepository.findAll();
    }

    public Boolean Create(ProductTypeRequest productTypeRequest) {
        if (!productTypeRepository.existsById(productTypeRequest.getProductId())) {
            ProductType productType = new ProductType();
            productType.setProductId(productTypeRequest.getProductId());

            productTypeRepository.save(productType);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( ProductTypeRequest productTypeRequest) {
        if (productTypeRepository.existsById(productTypeRequest.getProductId())) {
            Optional<ProductType> order = productTypeRepository.findById(productTypeRequest.getProductId());
            order.get().setProductId(productTypeRequest.getProductId());
            order.get().setProductName(productTypeRequest.getProductName());

            productTypeRepository.save(order.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(Long id) {
        if (productTypeRepository.existsById(id)) {
            productTypeRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
