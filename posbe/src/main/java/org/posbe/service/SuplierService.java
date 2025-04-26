package org.posbe.service;

import java.util.List;
import java.util.Optional;

import org.posbe.dto.PageResponse;
import org.posbe.dto.SuplierDto;
import org.posbe.dto.dto;
import org.posbe.model.Suplier;
import org.posbe.repository.SuplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuplierService {
    final SuplierRepository suplierRepository;

    public PageResponse getAllSupliers(Integer pageNo, Integer pageSize, String search) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Suplier> list = suplierRepository.findByNameContaining(search, pageable);
        List<SuplierDto> rs = list.getContent().stream().map(this::ConvertToDto).toList();
        return PageResponse.builder()
                .page(pageNo)
                .size(pageSize)
                .total(list.getTotalPages())
                .items(rs)
                .build();

    }

    public SuplierDto ConvertToDto(Suplier suplier) {
        return SuplierDto.builder()
                .id(suplier.getId())
                .supplierCode(suplier.getSupplierCode())
                .name(suplier.getName())
                .percent(suplier.getPercent())
                .address(suplier.getAddress())
                .sdt(suplier.getSdt())
                .build();
    }

    public Optional<Suplier> getSuplierById(Long id) {
        return suplierRepository.findById(id);
    }

    public Suplier createSuplier(Suplier Suplier) {
        if (suplierRepository.existsBySupplierCode(Suplier.getSupplierCode())) {
            throw new RuntimeException("Mã nhà cung cấp '" + Suplier.getSupplierCode() + "' đã tồn tại");
        }
        return suplierRepository.save(Suplier);
    }

    public Suplier updateSuplier(Long id, Suplier SuplierDetails) {
        return suplierRepository.findById(id).map(Suplier -> {
            Suplier.setSupplierCode(SuplierDetails.getSupplierCode());
            Suplier.setName(SuplierDetails.getName());
            Suplier.setPercent(SuplierDetails.getPercent());
            Suplier.setAddress(SuplierDetails.getAddress());
            Suplier.setSdt(SuplierDetails.getSdt());
            return suplierRepository.save(Suplier);
        }).orElseThrow(() -> new RuntimeException("Suplier not found"));
    }

    public void deleteSuplier(Long id) {
        suplierRepository.deleteById(id);
    }
}
