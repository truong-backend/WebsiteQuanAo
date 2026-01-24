import React, { useState } from 'react';
import type { FormState } from '../../type/Authencation/Authen';
import { authApi } from '../../api/Authen/Authapi';

const RegisterForm: React.FC = () => {
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
      // Gọi API signup (POST /auth/signup)
      const account = await authApi.signup(formData.email, formData.password);
      
      setMessage(`Đăng ký thành công! Account ID: ${account.id}`);
      setFormData({ email: '', password: '' });
      
      console.log('Signup response:', account);
    } catch (error: any) {
      setMessage(error.message || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng Ký</h2>
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
          {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
      </form>
      {message && <p style={{ color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default RegisterForm;