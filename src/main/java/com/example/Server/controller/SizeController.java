package com.example.Server.controller;

import com.example.Server.dto.request.size.*;
import com.example.Server.dto.response.size.*;
import com.example.Server.service.SizeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

/** Base path: /sizes */
@RestController @RequestMapping("/sizes")
public class SizeController {
    private final SizeService sizeService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "name");
    public SizeController(SizeService sizeService) { this.sizeService = sizeService; }

    @GetMapping("/options")
    public ResponseEntity<List<SizeOptionResponse>> getSizeOptions() { return ResponseEntity.ok(sizeService.getAllSizeOptions()); }

    @GetMapping
    public ResponseEntity<Page<SizeResponse>> getSizes(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(sizeService.findAll(PageRequest.of(page, size, sort), search));
    }

    @PostMapping
    public ResponseEntity<SizeResponse> createSize(@Valid @RequestBody SizeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sizeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SizeResponse> updateSize(@PathVariable String id, @Valid @RequestBody SizeUpdateRequest request) {
        return ResponseEntity.ok(sizeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSize(@PathVariable String id) {
        sizeService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SizeResponse> getSizeById(@PathVariable String id) { return ResponseEntity.ok(sizeService.getById(id)); }
}
