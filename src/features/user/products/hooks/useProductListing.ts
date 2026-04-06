// src/features/products/hooks/useProductListing.ts
// Business logic extracted from ProductListingPage
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductService } from "../services/productService";
import { CategoryService } from "@/features/user/categories";
import { LocalCartService } from "@/features/user/cart";
import type { ProductListItem } from "../types/product.types";
import type { SelectOption } from "@/types/common.types";

type SortDir = "asc" | "desc";
type SortBy = "price" | "name";

const PAGE_SIZE = 12;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 10_000_000;
const TOAST_DURATION_MS = 2500;

export function useProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastProduct, setToastProduct] = useState<{ name: string } | null>(
    null,
  );
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? "",
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category")
      ? Number(searchParams.get("category"))
      : undefined,
  );
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy] = useState<SortBy>(
    (searchParams.get("sortBy") as SortBy) ?? "price",
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    (searchParams.get("sortDir") as SortDir) ?? "desc",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
    setSearchQuery(searchParams.get("search") ?? "");
    setCategoryId(
      searchParams.get("category")
        ? Number(searchParams.get("category"))
        : undefined,
    );
    setCurrentPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search"), searchParams.get("category")]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    CategoryService.getCategorySelectOptions()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ProductService.getProductsForListing(
        currentPage,
        PAGE_SIZE,
        searchQuery || undefined,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        sortDir,
      );
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    categoryId,
    minPrice,
    maxPrice,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    fetchProducts();
    const p: Record<string, string> = { sortBy, sortDir };
    if (searchQuery) p.search = searchQuery;
    if (categoryId) p.category = String(categoryId);
    setSearchParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchQuery,
    categoryId,
    minPrice,
    maxPrice,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setCategoryId(undefined);
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
  };

  const handleAddToCart = (product: ProductListItem) => {
    LocalCartService.addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
      },
      1,
    );
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(
      () =>
        setAddedIds((prev) => {
          const n = new Set(prev);
          n.delete(product.id);
          return n;
        }),
      TOAST_DURATION_MS,
    );
    setToastProduct({ name: product.name });
    setToastOpen(true);
  };

  const activeCategoryName = categoryId
    ? categories.find((c) => c.value === categoryId)?.label
    : undefined;

  return {
    products,
    categories,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    toastOpen,
    setToastOpen,
    toastProduct,
    addedIds,
    searchInput,
    setSearchInput,
    categoryId,
    setCategoryId,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    drawerOpen,
    setDrawerOpen,
    fetchProducts,
    handleReset,
    handleAddToCart,
    activeCategoryName,
  };
}
