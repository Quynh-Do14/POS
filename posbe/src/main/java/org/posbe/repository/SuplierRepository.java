package org.posbe.repository;

import org.posbe.model.Suplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuplierRepository extends JpaRepository<Suplier, Long> {
    Page<Suplier> findAll(Pageable pageable);

    Page<Suplier> findByNameContaining(String name, Pageable pageable);

    boolean existsBySupplierCode(String supplierCode);
}
