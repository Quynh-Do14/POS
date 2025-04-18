package org.posbe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "suplier")
@Getter
@Setter
public class Suplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String supplierCode;
    private Long percent;
    private String name;
    private String address;
    private String sdt;
}
