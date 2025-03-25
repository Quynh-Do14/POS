package org.posbe.controller;

import lombok.RequiredArgsConstructor;
import org.posbe.dto.ProductDto;
import org.posbe.service.ExcelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/excel")
public class ExcelController {
    final ExcelService excelService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File không hợp lệ");
        }
        if (!file.getOriginalFilename().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body("Chỉ hỗ trợ file Excel (.xlsx)");
        }

        try {
            List<ProductDto> products = excelService.processExcelFile(file);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý file: " + e.getMessage());
        }
    }
}
