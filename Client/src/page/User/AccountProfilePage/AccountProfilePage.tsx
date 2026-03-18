// src/pages/Account/AccountProfilePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Skeleton } from "@mui/material";
import {
  Person as PersonIcon, ShoppingBag as ShoppingBagIcon,
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  Visibility as VisibilityIcon, Logout as LogoutIcon,
  Phone as PhoneIcon, Email as EmailIcon,
  LocationOn as LocationOnIcon, Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { authService } from "../../../Service/AuthService";
import { OrderService } from "../../../Service/OrderService";
import type { OrderResponse } from "../../../type/Orders/OrderResponse";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import StatusChip from "../../../Components/User/ui/StatusChip/StatusChip";
import PriceText from "../../../Components/User/ui/PriceText/PriceText";
import styles from "./AccountProfilePage.module.scss";

type UserProfile = { fullName: string; email: string; phone: string; address: string; username: string; role: string; };
type EditForm    = { fullName: string; phone: string; address: string; };

const AccountProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab]             = useState(0);
  const [user, setUser]           = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState<EditForm>({ fullName: "", phone: "", address: "" });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [orders, setOrders]         = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError]   = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = (authService as any).getCurrentUser?.() ?? { fullName: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567", address: "123 Đường Lê Lợi, Q.1, TP.HCM", username: "nguyenvana", role: "USER" };
      setUser(u); setEditForm({ fullName: u.fullName ?? "", phone: u.phone ?? "", address: u.address ?? "" });
    } catch {} finally { setLoadingUser(false); }
  }, []);

  useEffect(() => {
    OrderService.getMyOrders?.()
      .then(setOrders)
      .catch((err: unknown) => setOrderError(err instanceof Error ? err.message : "Không thể tải lịch sử đơn hàng"))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true); setSaveError(null);
      await (authService as any).updateProfile?.(editForm);
      setUser((prev) => prev ? { ...prev, ...editForm } : prev);
      setEditing(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { setSaveError(err instanceof Error ? err.message : "Không thể cập nhật thông tin"); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { authService.logout?.(); navigate("/login"); };
  const initials = user?.fullName?.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase() ?? "U";

  const stats = [
    { label: "Tổng đơn hàng",  value: orders.length,                                                                          icon: "🛍",  color: "#0f3460" },
    { label: "Đang xử lý",     value: orders.filter((o) => ["PENDING","PROCESSING"].includes(o.status)).length,               icon: "⏳",  color: "#e8a020" },
    { label: "Hoàn thành",     value: orders.filter((o) => o.status === "DELIVERED").length,                                   icon: "✅",  color: "#22c55e" },
    { label: "Tổng chi tiêu",  value: orders.filter((o) => o.status !== "CANCELLED").reduce((s,o) => s+(o.totalAmount??0),0).toLocaleString("vi-VN") + "₫", icon: "💰", color: "#e94560" },
  ];

  return (
    <PageLayout bgcolor="#f8f7f4">
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Hero */}
          <div className={styles.hero}>
            {[240,160,80].map((s,i) => <div key={i} className={styles.heroRing} style={{ width: s, height: s, right: -s/3, top: "50%", transform: "translateY(-50%)" }} />)}
            {loadingUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
                <Skeleton variant="circular" width={88} height={88} />
                <div style={{ flex: 1 }}><Skeleton variant="text" width="40%" height={36} /><Skeleton variant="text" width="25%" /></div>
              </div>
            ) : (
              <>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.heroInfo}>
                  <h1 className={styles.heroName}>{user?.fullName}</h1>
                  <p className={styles.heroUser}>@{user?.username}</p>
                  <div className={styles.heroBadges}>
                    <span className={`${styles.badge} ${styles["badge--role"]}`}>{user?.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}</span>
                    <span className={`${styles.badge} ${styles["badge--count"]}`}>{orders.length} đơn hàng</span>
                  </div>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}><LogoutIcon sx={{ fontSize: 16 }} />Đăng xuất</button>
              </>
            )}
          </div>

          {/* Stats */}
          {!loadingOrders && (
            <div className={styles.stats}>
              {stats.map((s, i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: s.color + "18" }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                  </div>
                  <div>
                    <span className={styles.statLbl}>{s.label}</span>
                    <div className={styles.statVal}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabsCard}>
            <div className={styles.tabBar}>
              <button className={`${styles.tabBtn} ${tab === 0 ? styles["tabBtn--active"] : ""}`} onClick={() => setTab(0)}>
                <PersonIcon sx={{ fontSize: 16 }} />Thông tin cá nhân
              </button>
              <button className={`${styles.tabBtn} ${tab === 1 ? styles["tabBtn--active"] : ""}`} onClick={() => setTab(1)}>
                <ShoppingBagIcon sx={{ fontSize: 16 }} />Lịch sử đơn hàng
              </button>
            </div>

            {/* Tab 0 — Profile */}
            {tab === 0 && (
              <div className={styles.tabPanel}>
                {saveSuccess && <div className={styles.alertSuccess}>✅ Cập nhật thông tin thành công!</div>}
                {saveError   && <div className={styles.alertError}>❌ {saveError}</div>}
                {loadingUser ? (
                  <div>{[1,2,3,4].map((i) => <Skeleton key={i} variant="text" height={56} sx={{ mb: 1 }} />)}</div>
                ) : (
                  <div>
                    <div className={styles.formGrid}>
                      <div>
                        {editing
                          ? <TextField fullWidth label="Họ và tên" value={editForm.fullName} onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))} size="small" />
                          : <div className={styles.infoRow}><span className={styles.infoRow__icon}><PersonIcon sx={{ fontSize: 20 }} /></span><div><span className={styles.infoRow__lbl}>Họ và tên</span><span className={styles.infoRow__val}>{user?.fullName}</span></div></div>
                        }
                      </div>
                      <div className={styles.infoRow}><span className={styles.infoRow__icon}><PersonIcon sx={{ fontSize: 20 }} /></span><div><span className={styles.infoRow__lbl}>Tên đăng nhập</span><span className={styles.infoRow__val}>{user?.username}</span></div></div>
                      <div className={styles.infoRow}><span className={styles.infoRow__icon}><EmailIcon sx={{ fontSize: 20 }} /></span><div><span className={styles.infoRow__lbl}>Email</span><span className={styles.infoRow__val}>{user?.email}</span></div></div>
                      <div>
                        {editing
                          ? <TextField fullWidth label="Số điện thoại" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} size="small" />
                          : <div className={styles.infoRow}><span className={styles.infoRow__icon}><PhoneIcon sx={{ fontSize: 20 }} /></span><div><span className={styles.infoRow__lbl}>Số điện thoại</span><span className={styles.infoRow__val}>{user?.phone}</span></div></div>
                        }
                      </div>
                      <div className={styles.fullCol}>
                        {editing
                          ? <TextField fullWidth label="Địa chỉ" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} size="small" />
                          : <div className={styles.infoRow}><span className={styles.infoRow__icon}><LocationOnIcon sx={{ fontSize: 20 }} /></span><div><span className={styles.infoRow__lbl}>Địa chỉ</span><span className={styles.infoRow__val}>{user?.address}</span></div></div>
                        }
                      </div>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.formActions}>
                      {editing ? (
                        <>
                          <button className={styles.btnCancel} onClick={() => { setEditing(false); setSaveError(null); }}><CancelIcon sx={{ fontSize: 15, mr: .5 }} />Hủy</button>
                          <button className={styles.btnSave} onClick={handleSave} disabled={saving}><SaveIcon sx={{ fontSize: 15, mr: .5 }} />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                        </>
                      ) : (
                        <button className={styles.btnEdit} onClick={() => setEditing(true)}><EditIcon sx={{ fontSize: 15, mr: .5 }} />Chỉnh sửa thông tin</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1 — Orders */}
            {tab === 1 && (
              <div className={styles.tabPanel}>
                {loadingOrders && <div>{[1,2,3].map((i) => <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />)}</div>}
                {orderError && !loadingOrders && <div className={styles.alertError}>❌ {orderError}</div>}
                {!loadingOrders && !orderError && orders.length === 0 && (
                  <div className={styles.emptyOrders}>
                    <div className={styles.emptyOrders__icon}>🛍</div>
                    <p className={styles.emptyOrders__title}>Bạn chưa có đơn hàng nào</p>
                    <Link className={styles.emptyOrders__btn} to="/products">Bắt đầu mua sắm</Link>
                  </div>
                )}
                {!loadingOrders && !orderError && orders.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Mã đơn</th>
                          <th className={styles.th}>Thời gian</th>
                          <th className={styles.th}>Địa chỉ</th>
                          <th className={`${styles.th} ${styles["th--right"]}`}>Tổng tiền</th>
                          <th className={`${styles.th} ${styles["th--center"]}`}>Trạng thái</th>
                          <th className={`${styles.th} ${styles["th--center"]}`}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className={styles.tr}>
                            <td className={styles.td}><span className={styles.ordId}>#{order.id.slice(-8).toUpperCase()}</span></td>
                            <td className={styles.td}><span className={styles.ordTime}>{new Date(order.orderTime).toLocaleDateString("vi-VN")}</span></td>
                            <td className={styles.td}><span className={styles.ordAddr}>{order.address}</span></td>
                            <td className={`${styles.td} ${styles["td--right"]}`}><PriceText amount={order.totalAmount ?? 0} /></td>
                            <td className={`${styles.td} ${styles["td--center"]}`}><StatusChip status={order.status} /></td>
                            <td className={`${styles.td} ${styles["td--center"]}`}>
                              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                                <Link className={styles.iconBtn} to={`/orders/${order.id}`} title="Xem trạng thái"><VisibilityIcon sx={{ fontSize: 15 }} /></Link>
                                <Link className={styles.iconBtn} to={`/orders/${order.id}/invoice`} title="Hóa đơn"><ReceiptIcon sx={{ fontSize: 15 }} /></Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountProfilePage;