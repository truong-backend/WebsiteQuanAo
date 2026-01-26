// src/api/authApi.ts
import axios from "axios";
import type { LoginRequest } from "../../type/Authencation/LoginRequest";
import type { LoginResponse } from "../../type/Authencation/LoginResponse";

export const authApi = {
  login: (data: LoginRequest) =>
    axios.post<LoginResponse>("http://localhost:8080/auth/login", data)
};
