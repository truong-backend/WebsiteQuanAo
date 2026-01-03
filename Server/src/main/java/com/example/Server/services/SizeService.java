package com.example.Server.services;

import com.example.Server.dto.request.size.SizeRequest;
import com.example.Server.entity.Size;
import com.example.Server.repository.SizeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SizeService {
    private final SizeRepository sizeRepository;

    public SizeService(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }


    public List<Size> findAll() {
        return sizeRepository.findAll();
    }

    public Boolean Create(SizeRequest sizeRequest) {
        if (!sizeRepository.existsById(sizeRequest.getId())) {
            Size size = new Size();
            size.setId(sizeRequest.getId());
            size.setName(sizeRequest.getName());
            sizeRepository.save(size);
            return true;
        }else{
            return false;
        }
    }

    public Boolean Update( SizeRequest sizeRequest) {
        if (sizeRepository.existsById(sizeRequest.getId())) {
            Optional<Size> sizeEntity = sizeRepository.findById(sizeRequest.getId());
            sizeEntity.get().setId(sizeRequest.getId());
            sizeEntity.get().setName(sizeRequest.getName());
            sizeRepository.save(sizeEntity.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (sizeRepository.existsById(id)) {
            sizeRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
