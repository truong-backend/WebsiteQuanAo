import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice, formatDate, toast, cn } from "@shared/lib";
import {
  Button,
  Badge,
  Input,
  Select,
  Spinner,
  Modal,
  EmptyState,
} from "@shared/ui";
import { ROUTES } from "@shared/config";
import { useAuthStore } from "@features/auth/model/authStore";
import { isAdmin } from "@entities/user/model";
import {
  fetchProducts,
  fetchCategories,
} from "@features/catalog/api/catalogApi";
import {
  adminDeleteProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  fetchAllColors,
  fetchAllSizes,
  adminCreateColor,
  adminUpdateColor,
  adminDeleteColor,
  adminCreateSize,
  adminUpdateSize,
  adminDeleteSize,
  fetchVariants,
  adminCreateVariant,
  adminUpdateVariant,
  adminDeleteVariant,
  fetchAllOrdersAdmin,
  updateOrderStatusApi,
} from "@features/admin/api/adminApi";
import { ImageUploader } from "@features/upload/ui/ImageUploader";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from "@entities/order/model";
import type {
  OrderStatus,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductDetailDto,
  ProductListDto,
  VariantFullDto,
  VariantCreateRequest,
  VariantUpdateRequest,
  ColorDto,
  SizeDto,
} from "@shared/types";
import {
  fetchAllUsersAdmin,
  adminDeleteUser,
  adminToggleUserStatus,
  adminChangeUserRole,
} from '@features/user/api/userApi'
import type { UserDto } from '@shared/types'

type Tab = "products" | "orders" | "categories" | "colors" | "sizes" | "users";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>("products");

  if (!isAdmin(user)) return <Navigate to={ROUTES.home} replace />;

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">
        Admin
      </p>
      <h1 className="font-display text-4xl mb-8">Quản trị hệ thống</h1>

      <div className="flex gap-0 border-b border-brand-light mb-10 overflow-x-auto">
        {(
          [
            { key: "users", label: "Người dùng" },
            { key: "products", label: "Sản phẩm" },
            { key: "orders", label: "Đơn hàng" },
            { key: "categories", label: "Danh mục" },
            { key: "colors", label: "Màu sắc" },
            { key: "sizes", label: "Kích cỡ" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-6 py-3 text-xs uppercase tracking-widest border-b-2 transition-all duration-200 whitespace-nowrap",
              tab === t.key
                ? "border-brand-black text-brand-black"
                : "border-transparent text-brand-mid hover:text-brand-black",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <AdminUsers />}
      {tab === "products" && <AdminProducts />}
      {tab === "orders" && <AdminOrders />}
      {tab === "categories" && <AdminCategories />}
      {tab === "colors" && <AdminColors />}
      {tab === "sizes" && <AdminSizes />}
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Products tab ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminProducts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductListDto | null>(null);
  const [variantProduct, setVariantProduct] = useState<ProductListDto | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", page, search],
    queryFn: () =>
      fetchProducts({ page, size: 15, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast("Đã xóa");
    },
    onError: () => toast("Xóa thất bại", "error"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <Button onClick={() => setCreateOpen(true)}>+ Thêm sản phẩm</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !data?.content.length ? (
        <EmptyState icon="📦" title="Không có sản phẩm nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {[
                    "Ảnh",
                    "Tên sản phẩm",
                    "Danh mục",
                    "Giá",
                    "Trạng thái",
                    "Thao tác",
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
                {data.content.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-brand-cream/50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-12 h-14 object-cover bg-brand-cream"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs font-mono text-brand-mid">
                        {p.id.substring(0, 8)}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid">
                      {p.categoryName}
                    </td>
                    <td className="py-3 pr-4">
                      <p>{formatPrice(p.salePrice ?? p.basePrice)}</p>
                      {p.salePrice && (
                        <p className="text-xs text-brand-mid line-through">
                          {formatPrice(p.basePrice)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={p.inStock ? "success" : "error"}>
                        {p.inStock ? "Còn hàng" : "Hết hàng"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setVariantProduct(p)}
                          className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors"
                        >
                          Variants
                        </button>
                        <button
                          onClick={() => setEditProduct(p)}
                          className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa "${p.name}"?`))
                              deleteMutation.mutate(p.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors"
              >
                ← Trước
              </button>
              <span className="text-xs text-brand-mid">
                {data.number + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          invalidate();
          setCreateOpen(false);
        }}
      />

      {editProduct && (
        <EditProductModal
          productId={editProduct.id}
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          onUpdated={() => {
            invalidate();
            setEditProduct(null);
          }}
        />
      )}

      {variantProduct && (
        <VariantManagerModal
          product={variantProduct}
          open={!!variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}
    </div>
  );
}

// ── Create Product Modal ──────────────────────────────────────────

function CreateProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [form, setForm] = useState<ProductCreateRequest>({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    salePrice: null,
    mainImage: "",
    hoverImage: "",
    categoryId: 0,
  });

  const mutation = useMutation({
    mutationFn: () => adminCreateProduct(form),
    onSuccess: () => {
      toast("Đã tạo sản phẩm");
      onCreated();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Tạo thất bại";
      toast(msg, "error");
    },
  });

  const catOptions = [
    { value: "0", label: "Chọn danh mục..." },
    ...(cats ?? []).flatMap((c) => [
      { value: String(c.categoryId), label: c.categoryName },
      ...(c.childCategories ?? []).map((ch) => ({
        value: String(ch.categoryId),
        label: `  └ ${ch.categoryName}`,
      })),
    ]),
  ];

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setForm((f) => ({ ...f, name, slug }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm sản phẩm mới"
      className="max-w-2xl mx-4 p-8"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Tên sản phẩm"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <Select
            label="Danh mục"
            options={catOptions}
            value={String(form.categoryId)}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))
            }
          />
          <Input
            label="Giá gốc (VNĐ)"
            type="number"
            value={String(form.basePrice)}
            onChange={(e) =>
              setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))
            }
          />
          <Input
            label="Giá khuyến mãi"
            type="number"
            value={form.salePrice ? String(form.salePrice) : ""}
            placeholder="Để trống nếu không có"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                salePrice: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />

          {/* ── Image uploaders (MinIO) ── */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <ImageUploader
              label="Ảnh chính"
              value={form.mainImage || null}
              onChange={(url) => setForm((f) => ({ ...f, mainImage: url }))}
              folder="products"
            />
            <ImageUploader
              label="Ảnh hover (tuỳ chọn)"
              value={form.hoverImage || null}
              onChange={(url) => setForm((f) => ({ ...f, hoverImage: url }))}
              folder="products"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
              Mô tả
            </label>
            <textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button
          loading={mutation.isPending}
          disabled={!form.name || !form.mainImage || !form.categoryId}
          onClick={() => mutation.mutate()}
        >
          Tạo sản phẩm
        </Button>
      </div>
    </Modal>
  );
}

// ── Edit Product Modal ────────────────────────────────────────────

function EditProductModal({
  productId,
  open,
  onClose,
  onUpdated,
}: {
  productId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: product, isLoading } = useQuery<ProductDetailDto>({
    queryKey: ["product-detail", productId],
    queryFn: () =>
      import("@features/catalog/api/catalogApi").then((m) =>
        m.fetchProductById(productId),
      ),
    enabled: open,
  });

  const [form, setForm] = useState<ProductUpdateRequest | null>(null);

  // Init form once product loads
  if (product && !form) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      basePrice: product.basePrice,
      salePrice: product.salePrice ?? null,
      mainImage: product.mainImage,
      hoverImage: product.hoverImage ?? "",
      categoryId: product.category.id,
      active: product.active,
    });
  }

  const mutation = useMutation({
    mutationFn: () => adminUpdateProduct(productId, form!),
    onSuccess: () => {
      toast("Đã cập nhật sản phẩm");
      onUpdated();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Cập nhật thất bại";
      toast(msg, "error");
    },
  });

  const catOptions = [
    { value: "0", label: "Chọn danh mục..." },
    ...(cats ?? []).flatMap((c) => [
      { value: String(c.categoryId), label: c.categoryName },
      ...(c.childCategories ?? []).map((ch) => ({
        value: String(ch.categoryId),
        label: `  └ ${ch.categoryName}`,
      })),
    ]),
  ];

  return (
    <Modal
      open={open}
      onClose={() => {
        setForm(null);
        onClose();
      }}
      title="Chỉnh sửa sản phẩm"
      className="max-w-2xl mx-4 p-8"
    >
      {isLoading || !form ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Tên sản phẩm"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, name: e.target.value })
                  }
                />
              </div>
              <Input
                label="Slug (URL)"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => f && { ...f, slug: e.target.value })
                }
              />
              <Select
                label="Danh mục"
                options={catOptions}
                value={String(form.categoryId)}
                onChange={(e) =>
                  setForm(
                    (f) => f && { ...f, categoryId: Number(e.target.value) },
                  )
                }
              />
              <Input
                label="Giá gốc (VNĐ)"
                type="number"
                value={String(form.basePrice)}
                onChange={(e) =>
                  setForm(
                    (f) => f && { ...f, basePrice: Number(e.target.value) },
                  )
                }
              />
              <Input
                label="Giá khuyến mãi"
                type="number"
                value={form.salePrice ? String(form.salePrice) : ""}
                placeholder="Để trống nếu không có"
                onChange={(e) =>
                  setForm(
                    (f) =>
                      f && {
                        ...f,
                        salePrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      },
                  )
                }
              />

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <ImageUploader
                  label="Ảnh chính"
                  value={form.mainImage || null}
                  onChange={(url) =>
                    setForm((f) => f && { ...f, mainImage: url })
                  }
                  folder="products"
                />
                <ImageUploader
                  label="Ảnh hover (tuỳ chọn)"
                  value={form.hoverImage || null}
                  onChange={(url) =>
                    setForm((f) => f && { ...f, hoverImage: url })
                  }
                  folder="products"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={4}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, description: e.target.value })
                  }
                  className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
                />
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={form.active ?? true}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, active: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-gold"
                />
                <label htmlFor="active-toggle" className="text-sm">
                  Sản phẩm đang hoạt động
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setForm(null);
                onClose();
              }}
            >
              Hủy
            </Button>
            <Button
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Lưu thay đổi
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Variant Manager Modal ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function VariantManagerModal({
  product,
  open,
  onClose,
}: {
  product: ProductListDto;
  open: boolean;
  onClose: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editVariant, setEditVariant] = useState<VariantFullDto | null>(null);
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ["admin", "variants", product.id],
    queryFn: () => fetchVariants(product.id),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) =>
      adminDeleteVariant(product.id, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "variants", product.id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast("Đã xóa variant");
    },
    onError: () => toast("Xóa thất bại", "error"),
  });

  const invalidateVariants = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "variants", product.id],
    });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Variants — ${product.name}`}
      className="max-w-3xl mx-4 p-8"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-brand-mid">
            {variants?.length ?? 0} biến thể (màu × size × số lượng)
          </p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + Thêm variant
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !variants?.length ? (
          <EmptyState
            icon="🎨"
            title="Chưa có variant nào"
            description="Thêm variant để khách hàng chọn màu và size"
          />
        ) : (
          <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-brand-light">
                  {[
                    "SKU",
                    "Màu",
                    "Size",
                    "Ảnh",
                    "Số lượng",
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
                {variants.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-brand-cream/30 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-xs">{v.sku}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-brand-light flex-shrink-0"
                          style={{ backgroundColor: v.colorCode }}
                        />
                        <span className="text-xs">{v.colorName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 border border-brand-mid text-xs font-medium">
                        {v.sizeCode}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {v.imageUrl ? (
                        <img
                          src={v.imageUrl}
                          alt=""
                          className="w-10 h-12 object-cover border border-brand-light"
                        />
                      ) : (
                        <span className="text-xs text-brand-light">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-medium">{v.quantity}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={v.inStock ? "success" : "error"}>
                        {v.inStock ? "Còn" : "Hết"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditVariant(v)}
                          className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa variant ${v.sku}?`))
                              deleteMutation.mutate({ variantId: v.id });
                          }}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Variant Modal ── */}
      <AddVariantModal
        productId={product.id}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          invalidateVariants();
          setAddOpen(false);
        }}
      />

      {/* ── Edit Variant Modal ── */}
      {editVariant && (
        <EditVariantModal
          productId={product.id}
          variant={editVariant}
          open={!!editVariant}
          onClose={() => setEditVariant(null)}
          onUpdated={() => {
            invalidateVariants();
            setEditVariant(null);
          }}
        />
      )}
    </Modal>
  );
}

// ── Add Variant Modal ─────────────────────────────────────────────

function AddVariantModal({
  productId,
  open,
  onClose,
  onCreated,
}: {
  productId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: colors } = useQuery({
    queryKey: ["colors", "all"],
    queryFn: fetchAllColors,
  });
  const { data: sizes } = useQuery({
    queryKey: ["sizes", "all"],
    queryFn: fetchAllSizes,
  });

  const [form, setForm] = useState<VariantCreateRequest & { sku: string }>({
    sku: "",
    colorId: 0,
    sizeId: 0,
    quantity: 0,
    imageUrl: "",
  });

  const mutation = useMutation({
    mutationFn: () => adminCreateVariant(productId, form),
    onSuccess: () => {
      toast("Đã thêm variant");
      onCreated();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Tạo thất bại";
      toast(msg, "error");
    },
  });

  const activeColors = (colors ?? []).filter((c) => c.active);
  const activeSizes = (sizes ?? [])
    .filter((s) => s.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const colorOptions = [
    { value: "0", label: "Chọn màu..." },
    ...activeColors.map((c) => ({
      value: String(c.id),
      label: `${c.name} (${c.code})`,
    })),
  ];
  const sizeOptions = [
    { value: "0", label: "Chọn size..." },
    ...activeSizes.map((s) => ({ value: String(s.id), label: s.code })),
  ];

  // Auto-generate SKU from selected color+size
  const autoSku = () => {
    const color = activeColors.find((c) => c.id === form.colorId);
    const size = activeSizes.find((s) => s.id === form.sizeId);
    if (color && size) {
      const prefix = productId.substring(0, 6).toUpperCase();
      const colorCode = (color.nameEn ?? color.name)
        .substring(0, 3)
        .toUpperCase()
        .replace(/\s/g, "");
      setForm((f) => ({ ...f, sku: `${prefix}-${colorCode}-${size.code}` }));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm variant mới"
      className="max-w-lg mx-4 p-8"
    >
      <div className="flex flex-col gap-4">
        {/* Color + Size row */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Màu sắc *"
            options={colorOptions}
            value={String(form.colorId)}
            onChange={(e) =>
              setForm((f) => ({ ...f, colorId: Number(e.target.value) }))
            }
          />
          <Select
            label="Kích cỡ *"
            options={sizeOptions}
            value={String(form.sizeId)}
            onChange={(e) =>
              setForm((f) => ({ ...f, sizeId: Number(e.target.value) }))
            }
          />
        </div>

        {/* SKU with auto-generate */}
        <div className="flex gap-2 items-end">
          <Input
            label="SKU * (chỉ HOA, số, _ -)"
            value={form.sku}
            className="flex-1"
            onChange={(e) =>
              setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))
            }
          />
          <button
            type="button"
            onClick={autoSku}
            disabled={!form.colorId || !form.sizeId}
            className="h-10 px-3 text-[10px] uppercase tracking-wider border border-brand-light hover:border-brand-black disabled:opacity-40 transition-colors whitespace-nowrap mb-0"
          >
            Tự tạo
          </button>
        </div>

        {/* Quantity */}
        <Input
          label="Số lượng *"
          type="number"
          min="0"
          value={String(form.quantity)}
          onChange={(e) =>
            setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
          }
        />

        {/* Image uploader (optional override) */}
        <ImageUploader
          label="Ảnh variant (tuỳ chọn — ghi đè ảnh sản phẩm)"
          value={form.imageUrl || null}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          folder="variants"
          variant="inline"
        />

        {/* Preview của màu đã chọn */}
        {form.colorId > 0 &&
          (() => {
            const c = activeColors.find((x) => x.id === form.colorId);
            return c ? (
              <div className="flex items-center gap-2 text-xs text-brand-mid">
                <div
                  className="w-5 h-5 rounded-full border border-brand-light"
                  style={{ backgroundColor: c.code }}
                />
                <span>
                  {c.name} — {c.code}
                </span>
              </div>
            ) : null;
          })()}
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button
          loading={mutation.isPending}
          disabled={!form.sku || !form.colorId || !form.sizeId}
          onClick={() => mutation.mutate()}
        >
          Tạo variant
        </Button>
      </div>
    </Modal>
  );
}

// ── Edit Variant Modal ────────────────────────────────────────────

function EditVariantModal({
  productId,
  variant,
  open,
  onClose,
  onUpdated,
}: {
  productId: string;
  variant: VariantFullDto;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { data: colors } = useQuery({
    queryKey: ["colors", "all"],
    queryFn: fetchAllColors,
  });
  const { data: sizes } = useQuery({
    queryKey: ["sizes", "all"],
    queryFn: fetchAllSizes,
  });

  const [form, setForm] = useState<VariantUpdateRequest>({
    colorId: variant.colorId,
    sizeId: variant.sizeId,
    quantity: variant.quantity,
    imageUrl: variant.imageUrl ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => adminUpdateVariant(productId, variant.id, form),
    onSuccess: () => {
      toast("Đã cập nhật variant");
      onUpdated();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Cập nhật thất bại";
      toast(msg, "error");
    },
  });

  const activeColors = (colors ?? []).filter((c) => c.active);
  const activeSizes = (sizes ?? [])
    .filter((s) => s.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const colorOptions = activeColors.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.code})`,
  }));
  const sizeOptions = activeSizes.map((s) => ({
    value: String(s.id),
    label: s.code,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Sửa variant — ${variant.sku}`}
      className="max-w-lg mx-4 p-8"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Màu sắc *"
            options={colorOptions}
            value={String(form.colorId)}
            onChange={(e) =>
              setForm((f) => ({ ...f, colorId: Number(e.target.value) }))
            }
          />
          <Select
            label="Kích cỡ *"
            options={sizeOptions}
            value={String(form.sizeId)}
            onChange={(e) =>
              setForm((f) => ({ ...f, sizeId: Number(e.target.value) }))
            }
          />
        </div>

        <Input
          label="Số lượng *"
          type="number"
          min="0"
          value={String(form.quantity)}
          onChange={(e) =>
            setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
          }
        />

        <ImageUploader
          label="Ảnh variant (tuỳ chọn)"
          value={form.imageUrl || null}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          folder="variants"
          variant="inline"
        />
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Orders tab ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminOrders() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", page, status, search],
    queryFn: () =>
      fetchAllOrdersAdmin({
        page,
        size: 15,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: string; s: OrderStatus }) =>
      updateOrderStatusApi(id, s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast("Đã cập nhật");
    },
    onError: () => toast("Cập nhật thất bại", "error"),
  });

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    ...(
      [
        "PENDING",
        "CONFIRMED",
        "SHIPPING",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ] as OrderStatus[]
    ).map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] })),
  ];

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "SHIPPING",
    SHIPPING: "DELIVERED",
    DELIVERED: "COMPLETED",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Tìm theo SĐT, mã đơn..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="max-w-[200px]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !data?.content.length ? (
        <EmptyState icon="📋" title="Không có đơn hàng nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {[
                    "Mã đơn",
                    "Khách hàng",
                    "Ngày",
                    "Tổng",
                    "Trạng thái",
                    "Thao tác",
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
                {data.content.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-brand-cream/50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-brand-mid">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid text-xs">
                      {formatDate(order.orderTime)}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {nextStatus[order.status] && (
                        <button
                          onClick={() =>
                            statusMutation.mutate({
                              id: order.id,
                              s: nextStatus[order.status]!,
                            })
                          }
                          className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors"
                        >
                          → {ORDER_STATUS_LABEL[nextStatus[order.status]!]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors"
              >
                ← Trước
              </button>
              <span className="text-xs text-brand-mid">
                {data.number + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Categories tab ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminCategories() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateCategory({
        categoryName: newName,
        parentCategory: newParent ? { categoryId: Number(newParent) } : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast("Đã tạo danh mục");
      setNewName("");
      setNewParent("");
    },
    onError: () => toast("Tạo thất bại", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminUpdateCategory(id, { categoryName: name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast("Đã cập nhật danh mục");
      setEditingId(null);
      setEditingName("");
    },
    onError: () => toast("Cập nhật thất bại", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast("Đã xóa");
    },
    onError: () => toast("Xóa thất bại", "error"),
  });

  const rootCatOptions = [
    { value: "", label: "Không có (danh mục gốc)" },
    ...(categories ?? []).map((c) => ({
      value: String(c.categoryId),
      label: c.categoryName,
    })),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm danh mục mới</h2>
        <Input
          label="Tên danh mục"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Áo thun, Quần jeans..."
        />
        <Select
          label="Danh mục cha (tuỳ chọn)"
          options={rootCatOptions}
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
        />
        <Button
          loading={createMutation.isPending}
          disabled={!newName.trim()}
          onClick={() => createMutation.mutate()}
          className="self-start"
        >
          Tạo danh mục
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách danh mục</h2>
        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {(categories ?? []).map((cat) => (
              <li key={cat.categoryId}>
                <div className="flex items-center justify-between py-3 px-4 border border-brand-light hover:border-brand-mid transition-colors">
                  <div className="flex-1 mr-3">
                    {editingId === cat.categoryId ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="py-1 text-sm"
                        />
                        <Button
                          size="sm"
                          loading={updateMutation.isPending}
                          disabled={!editingName.trim()}
                          onClick={() => updateMutation.mutate({ id: cat.categoryId, name: editingName })}
                        >
                          Lưu
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Hủy</Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{cat.categoryName}</p>
                        {cat.childCategories?.length > 0 && (
                          <p className="text-xs text-brand-mid">
                            {cat.childCategories.length} danh mục con
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {editingId !== cat.categoryId && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditingId(cat.categoryId); setEditingName(cat.categoryName); }}
                        className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa danh mục "${cat.categoryName}"?`))
                            deleteMutation.mutate(cat.categoryId);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                {cat.childCategories?.map((child) => (
                  <div
                    key={child.categoryId}
                    className="flex items-center justify-between py-2 px-4 ml-6 border-l border-brand-light hover:bg-brand-cream/50 transition-colors"
                  >
                    {editingId === child.categoryId ? (
                      <div className="flex items-center gap-2 flex-1 mr-3">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="py-1 text-sm"
                        />
                        <Button
                          size="sm"
                          loading={updateMutation.isPending}
                          disabled={!editingName.trim()}
                          onClick={() => updateMutation.mutate({ id: child.categoryId, name: editingName })}
                        >
                          Lưu
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Hủy</Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-brand-charcoal">└ {child.categoryName}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setEditingId(child.categoryId); setEditingName(child.categoryName); }}
                            className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa danh mục "${child.categoryName}"?`))
                                deleteMutation.mutate(child.categoryId);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Colors tab ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminColors() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", name: "", nameEn: "" });
  const [editColor, setEditColor] = useState<ColorDto | null>(null);

  const { data: colors, isLoading } = useQuery({
    queryKey: ["admin", "colors"],
    queryFn: fetchAllColors,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateColor({
        code: form.code,
        name: form.name,
        nameEn: form.nameEn || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colors"] });
      toast("Đã tạo màu");
      setForm({ code: "", name: "", nameEn: "" });
    },
    onError: () => toast("Tạo thất bại", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (c: ColorDto) =>
      adminUpdateColor(c.id, {
        code: c.code,
        name: c.name,
        nameEn: c.nameEn ?? "",
        active: c.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colors"] });
      toast("Đã cập nhật màu");
      setEditColor(null);
    },
    onError: () => toast("Cập nhật thất bại", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteColor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "colors"] });
      toast("Đã vô hiệu hoá màu");
    },
    onError: () => toast("Thất bại", "error"),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm màu sắc mới</h2>
        <div className="flex items-end gap-3">
          <Input
            label="Mã màu hex"
            value={form.code}
            placeholder="#FF0000"
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          {form.code && /^#[0-9A-Fa-f]{3,6}$/.test(form.code) && (
            <div
              className="w-10 h-10 rounded border border-brand-light mb-0.5 flex-shrink-0"
              style={{ backgroundColor: form.code }}
            />
          )}
        </div>
        <Input
          label="Tên màu (tiếng Việt)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Tên màu (tiếng Anh, tuỳ chọn)"
          value={form.nameEn}
          onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
        />
        <Button
          loading={createMutation.isPending}
          disabled={!form.code || !form.name}
          onClick={() => createMutation.mutate()}
          className="self-start"
        >
          Tạo màu
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách màu</h2>
        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {(colors ?? []).map((color) => (
              <li
                key={color.id}
                className="flex items-center justify-between py-3 px-4 border border-brand-light"
              >
                {editColor?.id === color.id ? (
                  // ── Inline edit ──
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <input
                      type="color"
                      value={editColor.code}
                      onChange={(e) =>
                        setEditColor((c) => c && { ...c, code: e.target.value })
                      }
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      value={editColor.name}
                      onChange={(e) =>
                        setEditColor((c) => c && { ...c, name: e.target.value })
                      }
                      className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                      placeholder="Tên màu"
                    />
                    <button
                      onClick={() => updateMutation.mutate(editColor!)}
                      className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditColor(null)}
                      className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border border-brand-light"
                      style={{ backgroundColor: color.code }}
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {color.name}{" "}
                        {color.nameEn && (
                          <span className="text-brand-mid">
                            ({color.nameEn})
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-mono text-brand-mid">
                        {color.code}
                      </p>
                    </div>
                    {!color.active && <Badge variant="error">Inactive</Badge>}
                  </div>
                )}

                {editColor?.id !== color.id && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditColor(color)}
                      className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                    >
                      Sửa
                    </button>
                    {color.active && (
                      <button
                        onClick={() => {
                          if (confirm(`Vô hiệu hoá màu "${color.name}"?`))
                            deleteMutation.mutate(color.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── Sizes tab ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminSizes() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", name: "", sortOrder: "0" });
  const [editSize, setEditSize] = useState<SizeDto | null>(null);

  const { data: sizes, isLoading } = useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: fetchAllSizes,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateSize({
        code: form.code,
        name: form.name,
        sortOrder: Number(form.sortOrder),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] });
      toast("Đã tạo size");
      setForm({ code: "", name: "", sortOrder: "0" });
    },
    onError: () => toast("Tạo thất bại", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (s: SizeDto) =>
      adminUpdateSize(s.id, {
        code: s.code,
        name: s.name,
        sortOrder: s.sortOrder,
        active: s.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] });
      toast("Đã cập nhật size");
      setEditSize(null);
    },
    onError: () => toast("Cập nhật thất bại", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteSize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] });
      toast("Đã vô hiệu hoá size");
    },
    onError: () => toast("Thất bại", "error"),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm kích cỡ mới</h2>
        <Input
          label="Mã size (ví dụ: S, M, L, XL)"
          value={form.code}
          onChange={(e) =>
            setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
          }
        />
        <Input
          label="Tên size"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Thứ tự hiển thị"
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, sortOrder: e.target.value }))
          }
        />
        <Button
          loading={createMutation.isPending}
          disabled={!form.code || !form.name}
          onClick={() => createMutation.mutate()}
          className="self-start"
        >
          Tạo size
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách kích cỡ</h2>
        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {(sizes ?? [])
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((size) => (
                <li
                  key={size.id}
                  className="flex items-center justify-between py-3 px-4 border border-brand-light"
                >
                  {editSize?.id === size.id ? (
                    // ── Inline edit ──
                    <div className="flex items-center gap-2 flex-1 mr-3">
                      <span className="w-10 h-10 border border-brand-mid flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {editSize.code}
                      </span>
                      <input
                        value={editSize.name}
                        onChange={(e) =>
                          setEditSize(
                            (s) => s && { ...s, name: e.target.value },
                          )
                        }
                        className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                        placeholder="Tên size"
                      />
                      <input
                        type="number"
                        value={editSize.sortOrder}
                        onChange={(e) =>
                          setEditSize(
                            (s) =>
                              s && { ...s, sortOrder: Number(e.target.value) },
                          )
                        }
                        className="w-16 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                      />
                      <button
                        onClick={() => updateMutation.mutate(editSize!)}
                        className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditSize(null)}
                        className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 border border-brand-mid flex items-center justify-center text-sm font-medium">
                        {size.code}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{size.name}</p>
                        <p className="text-xs text-brand-mid">
                          Thứ tự: {size.sortOrder}
                        </p>
                      </div>
                      {!size.active && <Badge variant="error">Inactive</Badge>}
                    </div>
                  )}

                  {editSize?.id !== size.id && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditSize(size)}
                        className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                      >
                        Sửa
                      </button>
                      {size.active && (
                        <button
                          onClick={() => {
                            if (confirm(`Vô hiệu hoá size "${size.code}"?`))
                              deleteMutation.mutate(size.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function AdminUsers() {
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('')
  const [enabled, setEnabled] = useState('')
  const [editUser, setEditUser] = useState<UserDto | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, role, enabled],
    queryFn: () => fetchAllUsersAdmin({
      page,
      size: 20,
      search: search || undefined,
      role:   role   || undefined,
      enabled: enabled === '' ? undefined : enabled === 'true',
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã xóa tài khoản') },
    onError:   () => toast('Xóa thất bại', 'error'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => adminToggleUserStatus(id, enabled),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật') },
    onError:   () => toast('Thất bại', 'error'),
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'ROLE_USER' | 'ROLE_ADMIN' }) => adminChangeUserRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật quyền') },
    onError:   () => toast('Thất bại', 'error'),
  })

  const roleOptions = [
    { value: '',           label: 'Tất cả vai trò' },
    { value: 'ROLE_USER',  label: 'Người dùng' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
  ]
  const enabledOptions = [
    { value: '',      label: 'Tất cả trạng thái' },
    { value: 'true',  label: 'Đang hoạt động' },
    { value: 'false', label: 'Đã bị khóa' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-xs"
        />
        <Select
          options={roleOptions}
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(0) }}
          className="max-w-[160px]"
        />
        <Select
          options={enabledOptions}
          value={enabled}
          onChange={(e) => { setEnabled(e.target.value); setPage(0) }}
          className="max-w-[180px]"
        />
      </div>

      {/* Summary */}
      {data && (
        <p className="text-xs text-brand-mid">
          Tổng cộng: <strong>{data.totalElements}</strong> tài khoản
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="👥" title="Không tìm thấy tài khoản nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['ID', 'Tên / Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-brand-mid">{u.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium line-clamp-1">{u.name}</p>
                      <p className="text-xs text-brand-mid">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid text-xs">{u.phone ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.role === 'ROLE_ADMIN' ? 'gold' : 'default'}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.enabled ? 'success' : 'error'}>
                        {u.enabled ? 'Hoạt động' : 'Bị khóa'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-brand-mid">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Toggle status */}
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: u.id, enabled: !u.enabled })}
                          className={cn(
                            'text-[10px] uppercase tracking-wider transition-colors',
                            u.enabled
                              ? 'text-orange-500 hover:text-orange-700'
                              : 'text-green-600 hover:text-green-800',
                          )}
                        >
                          {u.enabled ? 'Khóa' : 'Mở khóa'}
                        </button>

                        {/* Toggle role */}
                        <button
                          onClick={() => {
                            const newRole = u.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN'
                            if (confirm(`Đổi quyền ${u.name} thành ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}?`)) {
                              changeRoleMutation.mutate({ id: u.id, role: newRole })
                            }
                          }}
                          className="text-[10px] uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors"
                        >
                          {u.role === 'ROLE_ADMIN' ? '↓ User' : '↑ Admin'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditUser(u)}
                          className="text-[10px] uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                        >
                          Sửa
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Xóa tài khoản ${u.email}? Hành động này không thể hoàn tác!`)) {
                              deleteMutation.mutate(u.id)
                            }
                          }}
                          className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">
                ← Trước
              </button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}

// ── Edit User Modal ───────────────────────────────────────────────

function EditUserModal({ user, open, onClose, onUpdated }: {
  user: UserDto; open: boolean; onClose: () => void; onUpdated: () => void
}) {
  const [form, setForm] = useState({
    name:      user.name,
    phone:     user.phone ?? '',
    avatarUrl: user.avatarUrl ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => import('@features/user/api/userApi').then((m) => m.adminUpdateUser(user.id, form)),
    onSuccess:  () => { toast('Đã cập nhật'); onUpdated() },
    onError:    (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(msg ?? 'Thất bại', 'error')
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={`Sửa tài khoản — ${user.email}`} className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <Input label="Họ và tên *" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Số điện thoại" value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <ImageUploader
          label="Ảnh đại diện"
          value={form.avatarUrl || null}
          folder="avatars"
          variant="inline"
          onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
        />
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.name.trim()} onClick={() => mutation.mutate()}>
          Lưu
        </Button>
      </div>
    </Modal>
  )
}