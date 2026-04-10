package com.example.fashionstore.service.user;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.user.AddressDto;
import com.example.fashionstore.dto.user.AddressRequest;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.user.UserAddress;
import com.example.fashionstore.repository.user.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAddressService {

    private static final int MAX_ADDRESSES = 5;

    private final UserAddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<AddressDto> getMyAddresses() {
        User user = SecurityUtils.getCurrentUser();
        return addressRepository
                .findByUserIdOrderByDefaultAddressDescCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    public AddressDto addAddress(AddressRequest req) {
        User user = SecurityUtils.getCurrentUser();

        if (addressRepository.countByUserId(user.getId()) >= MAX_ADDRESSES)
            throw new BusinessException("Bạn chỉ có thể lưu tối đa " + MAX_ADDRESSES + " địa chỉ");

        // Nếu đây là địa chỉ đầu tiên hoặc user muốn đặt mặc định
        boolean isFirst = addressRepository.countByUserId(user.getId()) == 0;
        if (req.isDefaultAddress() || isFirst) {
            addressRepository.clearDefaultByUserId(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(req.getRecipientName().trim())
                .phone(req.getPhone().trim())
                .address(req.getAddress().trim())
                .defaultAddress(req.isDefaultAddress() || isFirst)
                .build();

        return toDto(addressRepository.save(address));
    }

    public AddressDto updateAddress(Long addressId, AddressRequest req) {
        User user = SecurityUtils.getCurrentUser();
        UserAddress address = findAndAuthorize(addressId, user.getId());

        if (req.isDefaultAddress() && !address.isDefaultAddress()) {
            addressRepository.clearDefaultByUserId(user.getId());
        }

        address.setRecipientName(req.getRecipientName().trim());
        address.setPhone(req.getPhone().trim());
        address.setAddress(req.getAddress().trim());
        if (req.isDefaultAddress()) {
            address.setDefaultAddress(true);
        }

        return toDto(addressRepository.save(address));
    }

    public void deleteAddress(Long addressId) {
        User user = SecurityUtils.getCurrentUser();
        UserAddress address = findAndAuthorize(addressId, user.getId());
        boolean wasDefault = address.isDefaultAddress();
        addressRepository.delete(address);

        // Nếu xóa địa chỉ mặc định, set địa chỉ gần nhất làm default
        if (wasDefault) {
            addressRepository
                    .findByUserIdOrderByDefaultAddressDescCreatedAtDesc(user.getId())
                    .stream().findFirst().ifPresent(a -> {
                        a.setDefaultAddress(true);
                        addressRepository.save(a);
                    });
        }
    }

    public AddressDto setDefault(Long addressId) {
        User user = SecurityUtils.getCurrentUser();
        UserAddress address = findAndAuthorize(addressId, user.getId());
        addressRepository.clearDefaultByUserId(user.getId());
        address.setDefaultAddress(true);
        return toDto(addressRepository.save(address));
    }

    private UserAddress findAndAuthorize(Long addressId, Integer userId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId))
            throw new BusinessException("Bạn không có quyền thao tác địa chỉ này");
        return address;
    }

    public AddressDto toDto(UserAddress a) {
        return AddressDto.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())
                .address(a.getAddress())
                .defaultAddress(a.isDefaultAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}