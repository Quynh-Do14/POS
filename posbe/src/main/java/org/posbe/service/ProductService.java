package org.posbe.service;

import lombok.RequiredArgsConstructor;
import org.posbe.dto.PageResponse;
import org.posbe.dto.ProductDto;
import org.posbe.dto.dto;
import org.posbe.model.Product;
import org.posbe.model.Suplier;
import org.posbe.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    final ProductRepository productRepository;

    // public Page<Product> getAllProducts(Pageable pageable) {
    // return productRepository.findAll(pageable);
    // }

    public PageResponse getAllProducts(Integer pageNo, Integer pageSize, String search) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Product> list = productRepository.findByNameContaining(search, pageable);
        List<dto> rs = list.getContent().stream().map(this::ConvertToDto).toList();
        return PageResponse.builder()
                .page(pageNo)
                .size(pageSize)
                .total(list.getTotalPages())
                .items(rs)
                .build();

    }

    public dto ConvertToDto(Product product) {
        return dto.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .unitPrice(product.getUnitPrice())
                .unit(product.getUnit())
                .salePrice(product.getSalePrice())
                .build();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        int count = productRepository.findAll().size();
        int number = count + 1;
        product.setCode(setCodeString(number));
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setCode(productDetails.getCode());
            product.setName(productDetails.getName());
            product.setUnitPrice(productDetails.getUnitPrice());
            product.setUnit(productDetails.getUnit());
            product.setSalePrice(productDetails.getSalePrice());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private String setCodeString(int number) {
        if (number >= 1 && number <= 9) {
            return "00" + number;
        } else if (number >= 10 && number <= 99) {
            return "0" + number;
        } else if (number >= 100 && number <= 999) {
            return String.valueOf(number);
        } else {
            return "";
        }
    }
}
