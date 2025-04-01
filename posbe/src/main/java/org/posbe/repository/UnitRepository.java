package org.posbe.repository;

import org.posbe.model.Unit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    @Query("SELECT nv FROM Unit nv")
    Page<Unit> findAllUnitPage(Pageable pageable);

    Page<Unit> findByNameContaining(String name, Pageable pageable);
}
