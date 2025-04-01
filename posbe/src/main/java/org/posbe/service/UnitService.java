package org.posbe.service;

import java.util.List;
import java.util.Optional;

import org.posbe.dto.PageResponse;
import org.posbe.dto.dto;
import org.posbe.dto.dto.dtoBuilder;
import org.posbe.model.Product;
import org.posbe.model.Unit;
import org.posbe.repository.UnitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UnitService {
    final UnitRepository unitRepository;

    public PageResponse getAllUnit(Integer pageNo, Integer pageSize, String search) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Unit> list = unitRepository.findByNameContaining(search, pageable);
        List<dto> rs = list.getContent().stream().map(this::ConvertToDto).toList();
        return PageResponse.builder()
                .page(pageNo)
                .size(pageSize)
                .total(list.getTotalPages())
                .items(rs)
                .build();

    }

    public dto ConvertToDto(Unit unit) {
        return dto.builder()
                .id(unit.getId())
                .name(unit.getName())
                .build();
    }

    public Optional<Unit> getUnitById(Long id) {
        return unitRepository.findById(id);
    }

    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }

    public Unit updateUnit(Long id, Unit unitDetails) {
        return unitRepository.findById(id).map(Unit -> {
            Unit.setName(unitDetails.getName());
            return unitRepository.save(unitDetails);
        }).orElseThrow(() -> new RuntimeException("Unit not found"));
    }

    public void deleteUnit(Long id) {
        unitRepository.deleteById(id);
    }
}
