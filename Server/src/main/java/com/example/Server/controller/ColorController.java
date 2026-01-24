package com.example.Server.controller;

import com.example.Server.dto.request.color.ColorCreateRequest;
import com.example.Server.dto.request.color.ColorUpdateRequest;
import com.example.Server.dto.response.color.ColorOptionResponse;
import com.example.Server.dto.response.color.ColorResponse;
import com.example.Server.services.ColorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST Controller for Color management
 * Base path: /colors
 */
@RestController
@RequestMapping("/colors")
public class ColorController {

    private final ColorService colorService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "code",
            "name"
    );

    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    /**
     * Get paginated colors with filter and search
     * GET /colors
     */

    @GetMapping("/options")
    public ResponseEntity<List<ColorOptionResponse>> getColorOptions() {
        return ResponseEntity.ok(colorService.getAllColorOptions());
    }
    @GetMapping
    public ResponseEntity<Page<ColorResponse>> getColors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "code";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                colorService.findAll(pageable, search)
        );
    }

    /**
     * Create color
     * POST /colors
     */
    @PostMapping
    public ResponseEntity<ColorResponse> createColor(
            @Valid @RequestBody ColorCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(colorService.create(request));
    }

    /**
     * Update color
     * PUT /colors/{code}
     */
    @PutMapping("/{code}")
    public ResponseEntity<ColorResponse> updateColor(
            @PathVariable String code,
            @Valid @RequestBody ColorUpdateRequest request
    ) {
        return ResponseEntity.ok(
                colorService.update(code, request)
        );
    }

    /**
     * Delete color
     * DELETE /colors/{code}
     */
    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteColor(@PathVariable String code) {
        colorService.delete(code);
        return ResponseEntity.noContent().build(); // 204
    }

    /**
     * Get color by code
     * GET /colors/{code}
     */
    @GetMapping("/{code}")
    public ResponseEntity<ColorResponse> getColorByCode(
            @PathVariable String code
    ) {
        return ResponseEntity.ok(
                colorService.getByCode(code)
        );
    }
}
