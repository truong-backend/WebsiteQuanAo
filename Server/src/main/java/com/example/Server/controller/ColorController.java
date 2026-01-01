package com.example.Server.controller;

import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.Color;
import com.example.Server.services.ColorService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/color")
@RestController
public class ColorController {
    private final ColorService colorService;

    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    @GetMapping("/all")
    public List<Color> getAllColors() {
        return colorService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveColor( ColorRequest color) {
        return colorService.Create(color);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateColor( ColorRequest color) {
        return colorService.Update(color);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteColor(String code) {
        return colorService.Delete(code);
    }
}
