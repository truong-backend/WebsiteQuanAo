package com.example.Server.mapper;

import com.example.Server.dto.response.contact.ContactResponse;
import com.example.Server.entity.Contact;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** Chuyển đổi Contact entity → ContactResponse. */
public class ContactMapper {

    public static ContactResponse toResponse(Contact contact) {
        if (contact == null) return null;

        ContactResponse r = new ContactResponse();
        r.setId(contact.getId());
        r.setName(contact.getName());
        r.setEmail(contact.getEmail());
        r.setPhone(contact.getPhone());
        r.setSubject(contact.getSubject());
        r.setMessage(contact.getMessage());
        r.setStatus(contact.getStatus());
        r.setCreatedAt(contact.getCreatedAt());
        r.setAdminNote(contact.getAdminNote());
        return r;
    }

    public static List<ContactResponse> toResponses(List<Contact> contacts) {
        if (contacts == null) return Collections.emptyList();
        return contacts.stream().map(ContactMapper::toResponse).collect(Collectors.toList());
    }
}
