package org.posbe.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class dto {
    private Long id;
    private String name;
    private Double unitPrice;
    private String unit;
    private Double salePrice;
}
