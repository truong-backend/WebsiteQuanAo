package com.example.Server.services;

import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.Color;
import com.example.Server.repository.ColorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ColorService {
    private final ColorRepository colorRepository;


    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    public List<Color> findAll() {
        return colorRepository.findAll();
    }

    public Boolean Create(ColorRequest colorRequest) {
        if (!colorRepository.existsById(colorRequest.getCode())) {
            Color colorEntity = new Color();
            colorEntity.setCode(colorRequest.getCode());
            colorEntity.setName(colorRequest.getName());
            colorRepository.save(colorEntity);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( ColorRequest colorRequest) {
        if (colorRepository.existsById(colorRequest.getCode())) {
            Optional<Color> color = colorRepository.findById(colorRequest.getCode());
            color.get().setName(colorRequest.getName());
            colorRepository.save(color.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String code) {
        if (colorRepository.existsById(code)) {
            colorRepository.deleteByCode(code);
            return true;
        }else{
            return false;
        }
    }

}
