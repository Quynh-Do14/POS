package org.posbe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true) 
    private Long id;
    private String code;
    private String name;
    private Double unitPrice; // đơn giá
    private String unit;
    private Double salePrice; // giá bán
}
