// pages/admin/ContactPage.tsx
import { useState, useEffect } from "react";
import { ContactService } from "@/modules";
import type {
  ContactResponse,
  ContactStatus,
  ContactStatusUpdateRequest,
  ContactReplyRequest,
} from "@/types";
import { ContactStatusLabels, ContactStatusColors } from "@/types";
import AdminModal from "@/components/admin/AdminModal";
import AdminPageState from "@/components/admin/AdminPageState";
import styles from "./ContactPage.module.scss";

// ─── Status Badge ─────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ContactStatus }) => (
  <span
    className={styles.badge}
    style={{
      background: ContactStatusColors[status] + "22",
      color: ContactStatusColors[status],
    }}
  >
    {ContactStatusLabels[status]}
  </span>
);

// ─── Reply Form ───────────────────────────────────────────────

interface ReplyFormProps {
  contact: ContactResponse;
  onSuccess: (updated: ContactResponse) => void;
}

const ReplyForm = ({ contact, onSuccess }: ReplyFormProps) => {
  const defaultSubject = contact.subject
    ? `Re: ${contact.subject}`
    : `Phản hồi liên hệ từ ${contact.name}`;

  const [form, setForm]       = useState<ContactReplyRequest>({ subject: defaultSubject, body: "" });
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSend = async () => {
    if (!form.body.trim()) { setError("Vui lòng nhập nội dung phản hồi"); return; }
    setSending(true); setError(null);
    try {
      const updated = await ContactService.sendReply(contact.id, form);
      onSuccess(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.replyForm}>
      <div className={styles.replyTo}>
        <span className={styles.label}>Gửi tới</span>
        <span className={styles.replyEmail}>
          {contact.name} &lt;{contact.email}&gt;
        </span>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reply-subject">Tiêu đề</label>
        <input
          id="reply-subject" name="subject" type="text"
          className={styles.input}
          value={form.subject} onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reply-body">Nội dung</label>
        <textarea
          id="reply-body" name="body" rows={6}
          className={styles.textarea}
          placeholder="Nhập nội dung email phản hồi..."
          value={form.body} onChange={handleChange}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? "Đang gửi..." : "✉ Gửi email phản hồi"}
      </button>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────

interface DetailPanelProps {
  contact: ContactResponse;
  onStatusChange: (id: number, req: ContactStatusUpdateRequest) => Promise<ContactResponse>;
  onReplySent: (updated: ContactResponse) => void;
}

const DetailPanel = ({ contact, onStatusChange, onReplySent }: DetailPanelProps) => {
  const [activeTab, setActiveTab] = useState<"info" | "reply">("info");
  const [status, setStatus]       = useState<ContactStatus>(contact.status);
  const [adminNote, setAdminNote] = useState(contact.adminNote ?? "");
  const [saving, setSaving]       = useState(false);

  // Cập nhật khi contact prop thay đổi (sau khi reply thành công)
  useEffect(() => {
    setStatus(contact.status);
    setAdminNote(contact.adminNote ?? "");
  }, [contact]);

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await onStatusChange(contact.id, { status, adminNote });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.detail}>
      {/* Info grid */}
      <div className={styles.infoGrid}>
        {[
          ["Họ tên",      contact.name],
          ["Email",       contact.email],
          ["Điện thoại",  contact.phone || "—"],
          ["Chủ đề",      contact.subject || "—"],
          ["Ngày gửi",    new Date(contact.createdAt).toLocaleString("vi-VN")],
        ].map(([label, value]) => (
          <div key={label} className={styles.infoRow}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>
              {label === "Email"
                ? <a href={`mailto:${value}`} className={styles.link}>{value}</a>
                : value}
            </span>
          </div>
        ))}
      </div>

      {/* Original message */}
      <div className={styles.messageBox}>
        <p className={styles.label}>Nội dung liên hệ</p>
        <p className={styles.messageText}>{contact.message}</p>
      </div>

      {/* Tabs: Trạng thái | Gửi phản hồi */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Trạng thái & Ghi chú
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reply" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("reply")}
        >
          ✉ Gửi email phản hồi
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className={styles.statusSection}>
          <label className={styles.label} htmlFor="status-select">Trạng thái</label>
          <select
            id="status-select"
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as ContactStatus)}
          >
            <option value="UNREAD">Chưa đọc</option>
            <option value="READ">Đã đọc</option>
            <option value="REPLIED">Đã trả lời</option>
          </select>

          <label className={styles.label} style={{ marginTop: 12 }}>Ghi chú nội bộ</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Ghi chú xử lý nội bộ (không hiển thị cho khách)..."
          />

          <button className={styles.saveBtn} onClick={handleSaveStatus} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      )}

      {activeTab === "reply" && (
        contact.status === "REPLIED" ? (
          <div className={styles.alreadyReplied}>
            <span>✓ Đã gửi phản hồi.</span>
            {contact.adminNote && (
              <pre className={styles.notePreview}>
                {contact.adminNote.replace("📧 Đã phản hồi:\n", "")}
              </pre>
            )}
          </div>
        ) : (
          <ReplyForm contact={contact} onSuccess={onReplySent} />
        )
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────

const ContactPage: React.FC = () => {
  const [contacts, setContacts]       = useState<ContactResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "">("");
  const [selected, setSelected]       = useState<ContactResponse | null>(null);
  const [stats, setStats]             = useState<Record<string, number>>({});

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [res, s] = await Promise.all([
        ContactService.getContactsPaged(
          0, 1000,
          search || undefined,
          filterStatus || undefined,
          "createdAt", "desc"
        ),
        ContactService.getStats(),
      ]);
      setContacts(res.content);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa liên hệ này?")) return;
    try { await ContactService.deleteContact(id); load(); }
    catch { alert("Xóa thất bại"); }
  };

  const handleOpen = async (contact: ContactResponse) => {
    const updated = contact.status === "UNREAD"
      ? await ContactService.getById(contact.id)  // tự đổi UNREAD → READ
      : contact;
    setSelected(updated);
    load(); // refresh badge + stats
  };

  const handleStatusChange = async (id: number, req: ContactStatusUpdateRequest) => {
    const updated = await ContactService.updateStatus(id, req);
    setSelected(updated);
    load();
    return updated;
  };

  const handleReplySent = (updated: ContactResponse) => {
    setSelected(updated);
    load(); // refresh stats: UNREAD/READ count giảm, REPLIED tăng
  };

  if (loading && contacts.length === 0)
    return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && contacts.length === 0)
    return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>

      {/* Header + Stats */}
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý liên hệ</h2>
        <div className={styles.stats}>
          {[
            { key: "TOTAL",   label: "Tổng",         color: "#374151" },
            { key: "UNREAD",  label: "Chưa đọc",     color: "#ef4444" },
            { key: "READ",    label: "Đã đọc",        color: "#3b82f6" },
            { key: "REPLIED", label: "Đã trả lời",   color: "#22c55e" },
          ].map(({ key, label, color }) => (
            <div key={key} className={styles.statCard}>
              <span className={styles.statNum} style={{ color }}>{stats[key] ?? 0}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput} type="text"
          placeholder="Tìm tên, email, chủ đề..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select} value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ContactStatus | "")}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="UNREAD">Chưa đọc</option>
          <option value="READ">Đã đọc</option>
          <option value="REPLIED">Đã trả lời</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Chủ đề</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>Không có liên hệ nào</td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className={c.status === "UNREAD" ? styles.rowUnread : ""}>
                  <td className={styles.nameCell}>
                    {c.status === "UNREAD" && <span className={styles.dot} />}
                    {c.name}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.subject || "—"}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className={styles.actions}>
                    <button className={styles.viewBtn} onClick={() => handleOpen(c)}>
                      Xem
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AdminModal
        open={selected !== null}
        title={`Liên hệ từ ${selected?.name ?? ""}`}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <DetailPanel
            contact={selected}
            onStatusChange={handleStatusChange}
            onReplySent={handleReplySent}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default ContactPage;
