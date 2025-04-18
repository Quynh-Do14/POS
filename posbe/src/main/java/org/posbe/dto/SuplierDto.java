package org.posbe.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SuplierDto {
    private Long id;
    private String supplierCode;
    private Long percent;
    private String name;
    private String address;
    private String sdt;
}
