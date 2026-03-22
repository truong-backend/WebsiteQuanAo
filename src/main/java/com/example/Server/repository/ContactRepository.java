package com.example.Server.repository;

import com.example.Server.entity.Contact;
import com.example.Server.enums.ContactStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository
        extends JpaRepository<Contact, Long>, JpaSpecificationExecutor<Contact> {

    long countByStatus(ContactStatus status);
}
