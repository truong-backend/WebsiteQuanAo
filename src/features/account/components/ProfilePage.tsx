// src/features/account/components/ProfilePage.tsx
// Moved from: src/pages/user/ProfilePage.tsx
// Changed imports: @/modules → ../services/accountService | @/types → ../types/account.types
import React, { useState, useEffect } from "react";
import ProfileLayout from "@/layouts/user/ProfileLayout";
import { AccountService } from "../services/accountService";
import type {
  AccountResponse,
  AccountUpdateRequest,
} from "../types/account.types";
import styles from "./ProfilePage.module.scss";

// ─── Sub-components ───────────────────────────────────────────

const ProfilePhoto: React.FC = () => (
  <div className={styles.photo__wrapper}>
    <div className={styles.photo__frame}>
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-KBIKLFQK253o9B-VRJvrDw8GW-IzmGP_UhyFPdPTKYhvJG5ez9PkDhi3um-JQyL0GMP9D6wg5PKobnRMAJPAmi8cQLCXnFs8hwo6bfX3zIiK_Qr-_AUuyOX5kXpyj9QwcLrv5InsqnIhhKD-TWM2xafJqQ8L5NlMw0Y5T2j2wB-E8DFdTXzcHqGuskNo4lJiCSGoH3_ukdQ_ezT9mhIWc0T3--t0iKCk3thTEavYxncT5bg11Mq90tChApHxgMERCj_BTcf8CsY"
        alt="Profile photo"
        className={styles.photo__img}
      />
    </div>
  </div>
);

const InfoField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className={styles.infoField}>
    <span className={styles.infoField__label}>{label}</span>
    <p className={styles.infoField__value}>{value || "—"}</p>
  </div>
);

// ─── Edit Profile Form ────────────────────────────────────────

interface EditFormProps {
  initial: AccountResponse;
  onSave: (data: AccountUpdateRequest) => Promise<void>;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<AccountUpdateRequest>({
    name: initial.name,
    email: initial.email,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setSaving(false);
    }
  };

  return (
    <form className={styles.editForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.infoGrid}>
        <div className={styles.editField}>
          <label className={styles.infoField__label}>Họ và tên</label>
          <input
            className={styles.editInput}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.infoField__label}>Email</label>
          <input
            className={styles.editInput}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
      <div className={styles.editActions}>
        <button type="submit" className={styles.editBtn} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={saving}
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

// ─── Change Password Form ─────────────────────────────────────

const ChangePasswordForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await AccountService.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setSaving(false);
    }
  };

  if (success)
    return (
      <div className={styles.passwordSuccess}>
        <span className={styles.successIcon}>✓</span>
        <p>Đổi mật khẩu thành công!</p>
      </div>
    );

  return (
    <form className={styles.editForm} onSubmit={handleSubmit} noValidate>
      {[
        { name: "oldPassword", label: "Mật khẩu hiện tại" },
        { name: "newPassword", label: "Mật khẩu mới" },
        { name: "confirm", label: "Xác nhận mật khẩu mới" },
      ].map(({ name, label }) => (
        <div key={name} className={styles.editField}>
          <label className={styles.infoField__label}>{label}</label>
          <input
            className={styles.editInput}
            type="password"
            name={name}
            value={(form as Record<string, string>)[name]}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>
      ))}
      {error && <p className={styles.errorMsg}>{error}</p>}
      <div className={styles.editActions}>
        <button type="submit" className={styles.editBtn} disabled={saving}>
          {saving ? "Đang lưu..." : "Đổi mật khẩu"}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

// ─── Page ─────────────────────────────────────────────────────

type Tab = "info" | "password";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    AccountService.getCurrentUser()
      .then(setUser)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Không thể tải thông tin",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: AccountUpdateRequest) => {
    const updated = await AccountService.updateCurrentUser(data);
    setUser(updated);
    setEditing(false);
  };

  if (loading)
    return (
      <ProfileLayout>
        <div className={styles.page}>
          <div className={styles.skeleton}>
            <div className={styles.skeleton__photo} />
            <div className={styles.skeleton__lines}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.skeleton__line} />
              ))}
            </div>
          </div>
        </div>
      </ProfileLayout>
    );

  if (error || !user)
    return (
      <ProfileLayout>
        <div className={styles.page}>
          <div className={styles.errorState}>
            <p>{error || "Không tìm thấy thông tin tài khoản"}</p>
            <button
              className={styles.editBtn}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      </ProfileLayout>
    );

  return (
    <ProfileLayout>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageHeader__title}>Trang cá nhân</h1>
            <p className={styles.pageHeader__sub}>
              Quản lý thông tin tài khoản
            </p>
          </div>
          {!editing && (
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              Chỉnh sửa
            </button>
          )}
        </header>

        <section className={styles.identity}>
          <div className={styles.identity__photoCol}>
            <ProfilePhoto />
          </div>
          <div className={styles.identity__infoCol}>
            <div className={styles.tabs}>
              <button
                className={[
                  styles.tab,
                  activeTab === "info" ? styles["tab--active"] : "",
                ].join(" ")}
                onClick={() => {
                  setActiveTab("info");
                  setEditing(false);
                }}
              >
                Thông tin
              </button>
              <button
                className={[
                  styles.tab,
                  activeTab === "password" ? styles["tab--active"] : "",
                ].join(" ")}
                onClick={() => {
                  setActiveTab("password");
                  setEditing(false);
                }}
              >
                Đổi mật khẩu
              </button>
            </div>

            {activeTab === "info" &&
              (editing ? (
                <EditForm
                  initial={user}
                  onSave={handleSave}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <div className={styles.infoGrid}>
                  <InfoField label="Họ và tên" value={user.name} />
                  <InfoField label="Email" value={user.email} />
                  <InfoField
                    label="Vai trò"
                    value={
                      user.roles === "ROLE_ADMIN"
                        ? "Quản trị viên"
                        : "Khách hàng"
                    }
                  />
                  <InfoField label="Mã tài khoản" value={`#${user.id}`} />
                </div>
              ))}

            {activeTab === "password" && (
              <ChangePasswordForm onClose={() => setActiveTab("info")} />
            )}
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
