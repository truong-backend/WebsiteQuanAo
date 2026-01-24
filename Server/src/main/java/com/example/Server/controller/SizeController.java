package com.example.Server.controller;

import com.example.Server.dto.request.size.SizeCreateRequest;
import com.example.Server.dto.request.size.SizeUpdateRequest;
import com.example.Server.dto.response.size.SizeOptionResponse;
import com.example.Server.dto.response.size.SizeResponse;
import com.example.Server.services.SizeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST Controller for Size management
 * Base path: /sizes
 */
@RestController
@RequestMapping("/sizes")
public class SizeController {

    private final SizeService sizeService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "name"
    );

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    /**
     * Get paginated sizes with filter and search
     * GET /sizes
     */
    @GetMapping
    public ResponseEntity<Page<SizeResponse>> getSizes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                sizeService.findAll(pageable, search)
        );
    }

    /**
     * Create size
     * POST /sizes
     */
    @PostMapping
    public ResponseEntity<SizeResponse> createSize(
            @Valid @RequestBody SizeCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(sizeService.create(request));
    }

    /**
     * Update size
     * PUT /sizes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<SizeResponse> updateSize(
            @PathVariable String id,
            @Valid @RequestBody SizeUpdateRequest request
    ) {
        return ResponseEntity.ok(
                sizeService.update(id, request)
        );
    }

    /**
     * Delete size
     * DELETE /sizes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSize(@PathVariable String id) {
        sizeService.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

    /**
     * Get size by id
     * GET /sizes/{id}
     */
    @GetMapping("/options")
    public ResponseEntity<List<SizeOptionResponse>> getSizeOptions() {
        return ResponseEntity.ok(sizeService.getAllSizeOptions());
    }
    @GetMapping("/{id}")
    public ResponseEntity<SizeResponse> getSizeById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                sizeService.getById(id)
        );
    }
}
