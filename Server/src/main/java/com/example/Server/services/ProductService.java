package com.example.Server.services;

import com.example.Server.dto.request.order.OrderRequest;
import com.example.Server.dto.request.product.ProductRequest;
import com.example.Server.entity.Order;
import com.example.Server.entity.Product;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;


    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Boolean Create(ProductRequest productRequest) {
        if (!productRepository.existsById(productRequest.getId())) {
            Product product = new Product();
            product.setId(productRequest.getId());
            product.setName(productRequest.getName());
            product.setDescription(productRequest.getDescription());
            product.setPrice(productRequest.getPrice());
            product.setPath(productRequest.getPath());
            product.setImg(productRequest.getImg());
            product.setHoverImg(productRequest.getHoverImg());
            productRepository.save(product);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( ProductRequest orderRequest) {
        if (productRepository.existsById(orderRequest.getId())) {
            Optional<Product> order = productRepository.findById(orderRequest.getId());
            order.get().setId(orderRequest.getId());
            order.get().setName(orderRequest.getName());
            order.get().setDescription(orderRequest.getDescription());
            order.get().setPrice(orderRequest.getPrice());
            order.get().setPath(orderRequest.getPath());
            order.get().setImg(orderRequest.getImg());
            order.get().setHoverImg(orderRequest.getHoverImg());
            productRepository.save(order.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
