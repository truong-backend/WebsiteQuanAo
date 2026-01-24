import React, { useState } from 'react';
import type { FormState } from '../../type/Authencation/Authen';
import { authApi } from './authApi';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<FormState>({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate
    if (!formData.email || !formData.password) {
      setMessage('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Gọi API đăng nhập qua authApi
      // authApi.login() tự động lưu token và user vào localStorage
      const response = await authApi.login(formData.email, formData.password);
      
      console.log('Đăng nhập thành công:', response);
      console.log('Token:', response.token);
      console.log('User:', response.user);
      
      setMessage('Đăng nhập thành công!');
      setFormData({ email: '', password: '' });
      
      // Gọi callback nếu có (để redirect hoặc update UI)
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      setMessage(error.message || 'Email hoặc password không đúng!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập password"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
      {message && <p style={{ color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default LoginForm;