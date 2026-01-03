package com.example.Server.controller;


import com.example.Server.dto.request.size.SizeRequest;
import com.example.Server.dto.request.size.SizeRequest;
import com.example.Server.entity.Size;
import com.example.Server.entity.Size;
import com.example.Server.services.SizeService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Size")
@RestController
public class SizeController {
    private final SizeService sizeService;

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    @GetMapping("/all")
    public List<Size> getAllSizes() {
        return sizeService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveSize( SizeRequest sizeRequest) {
        return sizeService.Create(sizeRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateSize( SizeRequest sizeRequest) {
        return sizeService.Update(sizeRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteSize(String id) {
        return sizeService.Delete(id);
    }
}
