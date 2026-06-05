import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn, toast } from "@shared/lib";
import { Button, Input, Spinner, Modal, EmptyState } from "@shared/ui";
import { ImageUploader } from "@features/upload/ui/ImageUploader";
import {
  adminFetchBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminToggleBanner,
  adminDeleteBanner,
  adminReorderBanners,
} from "@features/banner/api/bannerApi";
import type { BannerDto, BannerRequest, BannerType } from "@shared/types";

const BANNER_TYPE_LABEL: Record<BannerType, string> = {
  HERO: "🖼 Hero Slider",
  PROMOTION: "🏷 Khuyến mãi",
  CATEGORY: "📂 Danh mục",
  COLLECTION: "👗 Bộ sưu tập",
  BRAND: "🏢 Thương hiệu",
  FEATURED: "⭐ Nổi bật",
  EVENT: "🎉 Sự kiện",
  SERVICE: "🚚 Cam kết DV",
  POPUP: "💬 Popup",
  COUNTDOWN: "⏱ Đếm ngược",
};

const BANNER_TYPES = Object.keys(BANNER_TYPE_LABEL) as BannerType[];

const EMPTY_FORM: BannerRequest = {
  type: "HERO",
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  ctaText: "",
  discountPercent: undefined,
  startDate: "",
  endDate: "",
  active: true,
  sortOrder: 0,
  popupDelaySeconds: undefined,
  voucherCode: "",
};

// ── Reorder drag helpers ─────────────────────────────────────────────────────
function useDragReorder(
  items: BannerDto[],
  onReorder: (ids: number[]) => void,
) {
  const dragIndex = useRef<number | null>(null);

  const handleDragStart = (i: number) => {
    dragIndex.current = i;
  };

  const handleDrop = (i: number) => {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(i, 0, moved);
    dragIndex.current = null;
    onReorder(reordered.map((b) => b.id));
  };

  return { handleDragStart, handleDrop };
}

// ── Form Modal ───────────────────────────────────────────────────────────────
function BannerForm({
  initial,
  onSubmit,
  loading,
  onClose,
}: {
  initial: BannerRequest;
  onSubmit: (data: BannerRequest) => void;
  loading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BannerRequest>(initial);
  const set = (k: keyof BannerRequest, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Type */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
          Loại banner
        </label>
        <select
          className="border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
          value={form.type}
          onChange={(e) => set("type", e.target.value as BannerType)}
        >
          {BANNER_TYPES.map((t) => (
            <option key={t} value={t}>
              {BANNER_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Tiêu đề *"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <Input
        label="Mô tả ngắn"
        value={form.subtitle ?? ""}
        onChange={(e) => set("subtitle", e.target.value)}
      />

      {/* ── Ảnh desktop — upload lên MinIO ── */}
      <ImageUploader
        label="Ảnh banner *"
        folder="banners"
        value={form.imageUrl || null}
        onChange={(url) => set("imageUrl", url)}
        variant="card"
      />

      <Input
        label="URL liên kết"
        value={form.linkUrl ?? ""}
        onChange={(e) => set("linkUrl", e.target.value)}
      />
      <Input
        label="Nút CTA (vd: Mua ngay)"
        value={form.ctaText ?? ""}
        onChange={(e) => set("ctaText", e.target.value)}
      />

      {/* Conditional fields */}
      {(form.type === "PROMOTION" || form.type === "COUNTDOWN") && (
        <Input
          label="% Giảm giá"
          type="number"
          value={form.discountPercent ?? ""}
          onChange={(e) =>
            set(
              "discountPercent",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
        />
      )}

      {form.type === "POPUP" && (
        <>
          <Input
            label="Delay hiện popup (giây)"
            type="number"
            value={form.popupDelaySeconds ?? ""}
            onChange={(e) =>
              set(
                "popupDelaySeconds",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          <Input
            label="Mã voucher (tuỳ chọn)"
            value={form.voucherCode ?? ""}
            onChange={(e) => set("voucherCode", e.target.value)}
          />
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
            Ngày bắt đầu
          </label>
          <input
            type="datetime-local"
            className="border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
            value={form.startDate ?? ""}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
            Ngày kết thúc
          </label>
          <input
            type="datetime-local"
            className="border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
            value={form.endDate ?? ""}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>
      </div>

      <Input
        label="Thứ tự hiển thị"
        type="number"
        value={form.sortOrder ?? 0}
        onChange={(e) => set("sortOrder", Number(e.target.value))}
      />

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
        <input
          type="checkbox"
          checked={form.active ?? true}
          onChange={(e) => set("active", e.target.checked)}
          className="w-4 h-4 accent-brand-gold"
        />
        Kích hoạt ngay
      </label>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => onSubmit(form)}
          loading={loading}
          disabled={!form.imageUrl}
          className="flex-1"
        >
          Lưu banner
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AdminBanners() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<BannerDto | null>(null);
  const [filterType, setFilterType] = useState<BannerType | "ALL">("ALL");
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: adminFetchBanners,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });

  const createMutation = useMutation({
    mutationFn: adminCreateBanner,
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      toast("Đã tạo banner");
    },
    onError: () => toast("Tạo thất bại", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerRequest }) =>
      adminUpdateBanner(id, data),
    onSuccess: () => {
      invalidate();
      setEditBanner(null);
      toast("Đã cập nhật banner");
    },
    onError: () => toast("Cập nhật thất bại", "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: adminToggleBanner,
    onSuccess: () => {
      invalidate();
      toast("Đã thay đổi trạng thái");
    },
    onError: () => toast("Thao tác thất bại", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteBanner,
    onSuccess: () => {
      invalidate();
      toast("Đã xóa banner");
    },
    onError: () => toast("Xóa thất bại", "error"),
  });

  const reorderMutation = useMutation({
    mutationFn: adminReorderBanners,
    onSuccess: () => invalidate(),
    onError: () => toast("Sắp xếp thất bại", "error"),
  });

  const filtered = (banners ?? []).filter(
    (b) => filterType === "ALL" || b.type === filterType,
  );

  const { handleDragStart, handleDrop } = useDragReorder(filtered, (ids) =>
    reorderMutation.mutate(ids),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-brand-mid">
            {banners?.length ?? 0} banner
          </p>

          <select
            className="border border-brand-light px-3 py-1.5 text-xs focus:outline-none focus:border-brand-black"
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as BannerType | "ALL")
            }
          >
            <option value="ALL">Tất cả loại</option>
            {BANNER_TYPES.map((t) => (
              <option key={t} value={t}>
                {BANNER_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Tạo banner</Button>
      </div>

      {/* Stats bar */}
      {banners && banners.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng banner", value: banners.length },
            {
              label: "Đang bật",
              value: banners.filter((b) => b.active).length,
            },
            {
              label: "Tổng hiển thị",
              value: banners
                .reduce((s, b) => s + b.impressions, 0)
                .toLocaleString(),
            },
            {
              label: "Tổng click",
              value: banners.reduce((s, b) => s + b.clicks, 0).toLocaleString(),
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-brand-light p-4">
              <p className="text-[10px] uppercase tracking-wider text-brand-mid">
                {stat.label}
              </p>
              <p className="font-display text-2xl mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !filtered.length ? (
        <EmptyState icon="🖼" title="Chưa có banner nào" />
      ) : (
        <div className="overflow-x-auto">
          <p className="text-[10px] text-brand-mid mb-2 uppercase tracking-wider">
            ↕ Kéo thả để sắp xếp thứ tự
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-light">
                {[
                  "",
                  "Ảnh",
                  "Tiêu đề",
                  "Loại",
                  "Ngày hết hạn",
                  "CTR",
                  "Trạng thái",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light/50">
              {filtered.map((banner, i) => (
                <tr
                  key={banner.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  className={cn(
                    "transition-colors cursor-grab active:cursor-grabbing",
                    banner.active
                      ? "hover:bg-brand-cream/50"
                      : "opacity-50 bg-gray-50",
                  )}
                >
                  <td className="py-3 pr-2 text-brand-mid text-lg">⠿</td>
                  <td className="py-3 pr-4">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-20 h-12 object-cover border border-brand-light"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="48"><rect fill="%23eee" width="80" height="48"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="10">No img</text></svg>';
                      }}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium truncate max-w-[160px]">
                      {banner.title}
                    </p>
                    {banner.subtitle && (
                      <p className="text-[11px] text-brand-mid truncate max-w-[160px]">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.ctaText && (
                      <p className="text-[10px] text-brand-gold mt-0.5">
                        {banner.ctaText}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] uppercase tracking-wider border border-brand-light px-2 py-0.5 whitespace-nowrap">
                      {BANNER_TYPE_LABEL[banner.type]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-brand-mid text-xs">
                    {banner.endDate ? (
                      new Date(banner.endDate) < new Date() ? (
                        <span className="text-red-400">Đã hết hạn</span>
                      ) : (
                        new Date(banner.endDate).toLocaleDateString("vi-VN")
                      )
                    ) : (
                      <span className="text-brand-mid">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-xs font-medium">
                      {banner.ctr.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-brand-mid">
                      {banner.impressions.toLocaleString()} imp /{" "}
                      {banner.clicks.toLocaleString()} clk
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleMutation.mutate(banner.id)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        banner.active ? "bg-green-500" : "bg-gray-300",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                          banner.active ? "left-5" : "left-0.5",
                        )}
                      />
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditBanner(banner)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Xóa banner "${banner.title}"?`))
                            deleteMutation.mutate(banner.id);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo banner mới"
      >
        <BannerForm
          initial={EMPTY_FORM}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          onClose={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editBanner}
        onClose={() => setEditBanner(null)}
        title="Chỉnh sửa banner"
      >
        {editBanner && (
          <BannerForm
            initial={{
              type: editBanner.type,
              title: editBanner.title,
              subtitle: editBanner.subtitle ?? "",
              imageUrl: editBanner.imageUrl,
              linkUrl: editBanner.linkUrl ?? "",
              ctaText: editBanner.ctaText ?? "",
              discountPercent: editBanner.discountPercent ?? undefined,
              startDate: editBanner.startDate
                ? editBanner.startDate.substring(0, 16)
                : "",
              endDate: editBanner.endDate
                ? editBanner.endDate.substring(0, 16)
                : "",
              active: editBanner.active,
              sortOrder: editBanner.sortOrder,
              popupDelaySeconds: editBanner.popupDelaySeconds ?? undefined,
              voucherCode: editBanner.voucherCode ?? "",
            }}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editBanner.id, data })
            }
            loading={updateMutation.isPending}
            onClose={() => setEditBanner(null)}
          />
        )}
      </Modal>
    </div>
  );
}
