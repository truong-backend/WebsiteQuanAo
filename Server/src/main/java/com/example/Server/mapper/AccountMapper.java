package com.example.Server.mapper;

import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.entity.Account;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** Chuyển đổi Account entity → AccountResponse (không bao giờ trả về password). */
public class AccountMapper {
    public static AccountResponse toResponse(Account account) {
        if (account == null) return null;
        AccountResponse r = new AccountResponse();
        r.setId(account.getId());
        r.setName(account.getName());
        r.setEmail(account.getEmail());
        r.setRoles(account.getRoles());
        return r;
    }
    public static List<AccountResponse> toResponses(List<Account> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(AccountMapper::toResponse).collect(Collectors.toList());
    }
}
