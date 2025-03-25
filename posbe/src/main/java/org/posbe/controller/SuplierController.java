package org.posbe.controller;

import org.posbe.dto.PageResponse;
import org.posbe.model.Suplier;
import org.posbe.service.SuplierService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/suplier")
@RequiredArgsConstructor
public class SuplierController {
    final SuplierService suplierService;

    @GetMapping
    public ResponseEntity<PageResponse> getAllSupliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse response = suplierService.getAllSupliers(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Suplier> getSuplierById(@PathVariable Long id) {
        return suplierService.getSuplierById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Suplier> createSuplier(@RequestBody Suplier suplier) {
        return ResponseEntity.ok(suplierService.createSuplier(suplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Suplier> updateSuplier(@PathVariable Long id, @RequestBody Suplier Suplier) {
        return ResponseEntity.ok(suplierService.updateSuplier(id, Suplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuplier(@PathVariable Long id) {
        suplierService.deleteSuplier(id);
        return ResponseEntity.noContent().build();
    }
    
}
