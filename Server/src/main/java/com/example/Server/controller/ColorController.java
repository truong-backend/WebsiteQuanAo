package com.example.Server.controller;

import com.example.Server.dto.request.color.*;
import com.example.Server.dto.response.color.*;
import com.example.Server.service.ColorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

/** Base path: /colors */
@RestController @RequestMapping("/colors")
public class ColorController {
    private final ColorService colorService;
    private static final Set<String> ALLOWED_SORT = Set.of("code", "name");
    public ColorController(ColorService colorService) { this.colorService = colorService; }

    @GetMapping("/options")
    public ResponseEntity<List<ColorOptionResponse>> getColorOptions() { return ResponseEntity.ok(colorService.getAllColorOptions()); }

    @GetMapping
    public ResponseEntity<Page<ColorResponse>> getColors(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "code";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(colorService.findAll(PageRequest.of(page, size, sort), search));
    }

    @PostMapping
    public ResponseEntity<ColorResponse> createColor(@Valid @RequestBody ColorCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(colorService.create(request));
    }

    @PutMapping("/{code}")
    public ResponseEntity<ColorResponse> updateColor(@PathVariable String code, @Valid @RequestBody ColorUpdateRequest request) {
        return ResponseEntity.ok(colorService.update(code, request));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteColor(@PathVariable String code) {
        colorService.delete(code); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{code}")
    public ResponseEntity<ColorResponse> getColorByCode(@PathVariable String code) { return ResponseEntity.ok(colorService.getByCode(code)); }
}
