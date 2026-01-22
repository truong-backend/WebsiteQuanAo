package com.example.Server.mapper;

import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.entity.Account;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Account entity and its DTOs
 */
public class AccountMapper {

    /**
     * Convert Account entity to AccountResponse (excludes password)
     */
    public static AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }

        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setName(account.getName());
        response.setEmail(account.getEmail());
        response.setRoles(account.getRoles());

        return response;
    }

    /**
     * Convert list of Account entities to list of AccountResponse
     */
    public static List<AccountResponse> toResponses(List<Account> accounts) {
        if (accounts == null) {
            return Collections.emptyList();
        }

        return accounts.stream()
                .map(AccountMapper::toResponse)
                .collect(Collectors.toList());
    }
}
