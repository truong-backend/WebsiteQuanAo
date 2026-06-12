import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchActiveBanners,
  trackBannerClick,
  trackBannerImpression,
} from "../api/bannerApi";
import type { BannerDto } from "@shared/types";

// ── Track helper ──────────────────────────────────────────────────────────────
function useBannerTrack(banner: BannerDto) {
  useEffect(() => {
    trackBannerImpression(banner.id).catch(() => {});
  }, [banner.id]);

  const handleClick = useCallback(() => {
    trackBannerClick(banner.id).catch(() => {});
  }, [banner.id]);

  return handleClick;
}

// ── Wrapper link ──────────────────────────────────────────────────────────────
function BannerLink({
  banner,
  className,
  children,
}: {
  banner: BannerDto;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = useBannerTrack(banner);

  if (!banner.linkUrl) return <div className={className}>{children}</div>;

  const isExternal = banner.linkUrl.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={banner.linkUrl} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

// ── 1. HERO SLIDER ────────────────────────────────────────────────────────────
export function HeroBannerSlider({ fallback }: { fallback: React.ReactNode }) {
  const { data: banners } = useQuery({
    queryKey: ["banners", "HERO"],
    queryFn: () => fetchActiveBanners("HERO"),
    staleTime: 5 * 60 * 1000,
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % banners.length),
      5000,
    );
    return () => clearInterval(id);
  }, [banners]);

  if (!banners || banners.length === 0) return <>{fallback}</>;

  const banner = banners[current];

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-brand-black">
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={b.imageUrl}
            alt={b.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-black/50" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <BannerLink
          banner={banner}
          className="text-center text-brand-white flex flex-col items-center gap-8 px-6 animate-fade-up"
        >
          {banner.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              {banner.subtitle}
            </p>
          )}
          <h1 className="font-display text-6xl sm:text-8xl font-light leading-none">
            {banner.title}
          </h1>
          {banner.ctaText && (
            <span className="mt-2 px-8 py-3 bg-brand-white text-brand-black text-xs uppercase tracking-wider hover:bg-brand-gold transition-colors">
              {banner.ctaText}
            </span>
          )}
        </BannerLink>
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-brand-gold w-6" : "bg-brand-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── 2. PROMOTION BANNER (full-width editorial) ────────────────────────────────
export function PromotionBanner({ fallback }: { fallback: React.ReactNode }) {
  const { data: banners } = useQuery({
    queryKey: ["banners", "PROMOTION"],
    queryFn: () => fetchActiveBanners("PROMOTION"),
    staleTime: 5 * 60 * 1000,
  });

  if (!banners || banners.length === 0) return <>{fallback}</>;

  const banner = banners[0];

  return (
    <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-brand-charcoal flex items-center">
      <img
        src={banner.imageUrl}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="relative z-10 container mx-auto px-6 max-w-screen-xl">
        <div className="max-w-lg">
          {banner.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4">
              {banner.subtitle}
            </p>
          )}
          <h2 className="font-display text-5xl text-brand-white font-light mb-6">
            {banner.discountPercent ? (
              <>
                Sale đến
                <br />
                <span className="text-brand-gold">
                  {banner.discountPercent}%
                </span>
              </>
            ) : (
              banner.title
            )}
          </h2>
          {banner.ctaText && banner.linkUrl && (
            <BannerLink banner={banner}>
              <span className="inline-block px-8 py-3 bg-brand-gold text-brand-black text-xs uppercase tracking-wider hover:bg-brand-white transition-colors">
                {banner.ctaText}
              </span>
            </BannerLink>
          )}
        </div>
      </div>
    </section>
  );
}

// ── 3. SERVICE BANNER (benefits strip) ───────────────────────────────────────
export function ServiceBanners({ fallback }: { fallback: React.ReactNode }) {
  const { data: banners } = useQuery({
    queryKey: ["banners", "SERVICE"],
    queryFn: () => fetchActiveBanners("SERVICE"),
    staleTime: 10 * 60 * 1000,
  });

  if (!banners || banners.length === 0) return <>{fallback}</>;

  return (
    <section className="bg-brand-cream border-y border-brand-light">
      <div className="container mx-auto px-6 max-w-screen-xl">
        <ul
          className="grid divide-x divide-brand-light"
          style={{
            gridTemplateColumns: `repeat(${banners.length}, minmax(0, 1fr))`,
          }}
        >
          {banners.map((b) => (
            <li
              key={b.id}
              className="flex flex-col items-center gap-2 py-8 px-4 text-center cursor-pointer"
              onClick={() => trackBannerClick(b.id).catch(() => {})}
            >
              <p className="text-xs font-medium uppercase tracking-wider">
                {b.title}
              </p>
              {b.subtitle && (
                <p className="text-xs text-brand-mid">{b.subtitle}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── 4. POPUP BANNER ───────────────────────────────────────────────────────────
export function PopupBanner() {
  const { data: banners } = useQuery({
    queryKey: ["banners", "POPUP"],
    queryFn: () => fetchActiveBanners("POPUP"),
    staleTime: 10 * 60 * 1000,
  });

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!banners || banners.length === 0 || dismissed) return;
    const banner = banners[0];
    const delay = (banner.popupDelaySeconds ?? 3) * 1000;
    const id = setTimeout(() => {
      setVisible(true);
      trackBannerImpression(banner.id).catch(() => {});
    }, delay);
    return () => clearTimeout(id);
  }, [banners, dismissed]);

  if (!visible || !banners || banners.length === 0) return null;

  const banner = banners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 animate-fade-up">
      <div className="relative bg-brand-white max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="absolute top-3 right-3 z-10 text-brand-mid hover:text-brand-black text-xl leading-none"
        >
          ×
        </button>
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full max-h-64 object-cover"
        />
        <div className="p-6 text-center">
          <h3 className="font-display text-2xl mb-2">{banner.title}</h3>
          {banner.subtitle && (
            <p className="text-sm text-brand-mid mb-4">{banner.subtitle}</p>
          )}
          {banner.voucherCode && (
            <div className="border border-dashed border-brand-gold px-4 py-2 mb-4 inline-block">
              <span className="text-xs uppercase tracking-widest text-brand-mid">
                Mã giảm giá:{" "}
              </span>
              <span className="font-mono font-bold text-brand-gold">
                {banner.voucherCode}
              </span>
            </div>
          )}
          {banner.ctaText && banner.linkUrl && (
            <BannerLink banner={banner}>
              <span
                className="inline-block w-full py-3 bg-brand-black text-brand-white text-xs uppercase tracking-wider hover:bg-brand-gold hover:text-brand-black transition-colors"
                onClick={() => setDismissed(true)}
              >
                {banner.ctaText}
              </span>
            </BannerLink>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5. COUNTDOWN BANNER ───────────────────────────────────────────────────────
function useCountdown(endDate: string | null) {
  const calc = useCallback(() => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  }, [endDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

export function CountdownBanner() {
  const { data: banners } = useQuery({
    queryKey: ["banners", "COUNTDOWN"],
    queryFn: () => fetchActiveBanners("COUNTDOWN"),
    staleTime: 60 * 1000,
  });

  const banner = banners?.[0] ?? null;
  const time = useCountdown(banner?.endDate ?? null);

  if (!banner || !time) return null;

  return (
    <section className="bg-brand-black text-brand-white py-6">
      <div className="container mx-auto px-6 max-w-screen-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {banner.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-1">
              {banner.subtitle}
            </p>
          )}
          <h3 className="font-display text-2xl">{banner.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Giờ", val: time.h },
            { label: "Phút", val: time.m },
            { label: "Giây", val: time.s },
          ].map(({ label, val }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl font-bold text-brand-gold tabular-nums">
                  {String(val).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-white/50">
                  {label}
                </span>
              </div>
              {i < 2 && (
                <span className="text-brand-gold text-2xl font-light mb-3">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
        {banner.ctaText && banner.linkUrl && (
          <BannerLink banner={banner}>
            <span className="px-6 py-2.5 bg-brand-gold text-brand-black text-xs uppercase tracking-wider hover:bg-brand-white transition-colors inline-block">
              {banner.ctaText}
            </span>
          </BannerLink>
        )}
      </div>
    </section>
  );
}
