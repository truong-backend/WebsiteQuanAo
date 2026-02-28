// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../Service/AuthService';
import type { LoginRequest } from '../../../type/authcation/LoginRequest';

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      await authService.login(values);
      message.success('Đăng nhập thành công!');

      // Redirect theo role
      if (authService.isAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="Đăng nhập">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng nhập
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <span>Chưa có tài khoản? </span>
            <Link to="/register">Đăng ký ngay</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;