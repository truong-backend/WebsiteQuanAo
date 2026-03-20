// src/pages/user/ProfilePage.tsx
// Trang cá nhân user — thiết kế theo The Atelier style
// Dùng trong ProfileLayout (sidebar + main đã có sẵn)

import React from 'react';
import styles from './ProfilePage.module.scss';
import Footer from '@/components/user/layout/Footer';
import Navbar from '@/components/user/layout/Navbar';


// ─── Types ────────────────────────────────────────────────────

interface StylePreference {
  icon: string; // material symbol name
  label: string;
  value: string;
}

interface RecommendedItem {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  imageAlt: string;
  offset?: boolean; // stagger vertically like the HTML design
}

// ─── Static data (thay bằng API call thực tế) ─────────────────

const STYLE_PREFERENCES: StylePreference[] = [
  {
    icon: 'architecture',
    label: 'Palette',
    value: 'Charcoal, Slate, and Warm Ochre accents.',
  },
  {
    icon: 'texture',
    label: 'Materials',
    value: 'Fine-gauge merino wool and brushed silk blends.',
  },
  {
    icon: 'straighten',
    label: 'Fit',
    value: 'Architectural tailoring with relaxed proportions.',
  },
];

const RECOMMENDED_ITEMS: RecommendedItem[] = [
  {
    id: '1',
    name: 'The Signature Overcoat',
    price: '£1,450',
    category: 'Bespoke',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJlwoPz9rPsumGFOJNLwggnwsZCaIkj0VVNB_QL0ZhWkthmTU_33Y0qrfc3VVAK0IUP-4V-0085IzR_vFVHpymGWWVUyrBIccC-a16IkZjP7anUxh01SSqeMOhATf8IkZSaHFroJvsfjljosmo8tQ2B03XRuw3DZtyTHtNXnI1Gb5T_54bVPeG_N7jYVJaEoINl9vKYS5Wq7E0y21B5ZIZMK4UXJkffPo4QNvUJckXPNYFv627HAKZXtg0eMsdEhF2iGIMNipb2fE',
    imageAlt: 'Deep charcoal wool overcoat on a minimalist hanger',
    offset: false,
  },
  {
    id: '2',
    name: 'Atelier Silk Wrap',
    price: '£290',
    category: 'Accessories',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmwJV8MMswhmpMW3N0eRXizlLRON2vz1cyfDW6jGEHEoaVxONoIPBio7T1l2WU7dEBrSChfWsT3lFwvU_rdNmosfffVSEIXR-DL9umhc-NbGf7O-lZXlvNzdlYZ22vrRbgwFVEfmWd5ZVTFsdWOBqHhsrkvwkbCj9n6RqTk6eCYnIhVsW-kp9Gu1Y08Ovaoq-aMeIOkf2J-rA7d7txhq8mgTmFwd_D9TLzQANri7LVQ7Xj6F7yRbOJSgstriDlJqwLFe0WbnBetgE',
    imageAlt: 'Abstract pattern silk scarf in gold and obsidian tones',
    offset: true,
  },
  {
    id: '3',
    name: 'Chelsea Sculpt Boot',
    price: '£620',
    category: 'Footwear',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMNgA7RxOHj-92wC5yBwnUmnVYiPFWDXkefH3PxkyCK-pKEiRU8veBMV6sFvsEQ_c8E77Jo6QMxy4VFaoUMVAA2e5YOOAhT201LKaAPOtLe6tOlFCibaI7STiV2RhcXFC0sogoBP8isjO3pdTRFgE-KyJoiX1t7Uv23Ufj12TNLaW6VQ4xKr3zByIIG_VMg9TJXBmDn6GsFlwFT_DZ4ioJOhgsM3_Lh3-OOwWttuCQi84ONLznPF2QQ28Dsx1bOvcjVM-5FmjO1x4',
    imageAlt: 'Handcrafted black leather chelsea boots on a stone pedestal',
    offset: false,
  },
];

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
    <button className={styles.photo__editBtn} aria-label="Change photo">
      <span className="material-symbols-outlined">camera_alt</span>
    </button>
  </div>
);

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className={styles.infoField}>
    <span className={styles.infoField__label}>{label}</span>
    <p className={styles.infoField__value}>{value}</p>
  </div>
);

const StyleCard: React.FC<StylePreference> = ({ icon, label, value }) => (
  <div className={styles.styleCard}>
    <span className={`material-symbols-outlined ${styles.styleCard__icon}`}>{icon}</span>
    <h3 className={styles.styleCard__label}>{label}</h3>
    <p className={styles.styleCard__value}>{value}</p>
  </div>
);

const ProductCard: React.FC<RecommendedItem> = ({ name, price, category, image, imageAlt, offset }) => (
  <div className={`${styles.productCard} ${offset ? styles['productCard--offset'] : ''}`}>
    <div className={styles.productCard__imgWrap}>
      <img src={image} alt={imageAlt} className={styles.productCard__img} />
      <button className={styles.productCard__wishBtn} aria-label="Add to wishlist">
        <span className="material-symbols-outlined">favorite</span>
      </button>
    </div>
    <h3 className={styles.productCard__name}>{name}</h3>
    <p className={styles.productCard__meta}>
      {price} — {category}
    </p>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  return (
    <div className={styles.page}>
        <Navbar />
      {/* ── Header ── */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeader__title}>My Profile</h1>
          <p className={styles.pageHeader__sub}>
            Manage your personal details and aesthetic preferences.
          </p>
        </div>
        <button className={styles.editBtn}>Edit Profile</button>
      </header>

      {/* ── Identity block ── */}
      <section className={styles.identity}>
        {/* Photo column */}
        <div className={styles.identity__photoCol}>
          <ProfilePhoto />
        </div>

        {/* Info + style prefs column */}
        <div className={styles.identity__infoCol}>
          {/* Basic fields */}
          <div className={styles.infoGrid}>
            <InfoField label="Full Name"      value="Julian Vane-Tempest" />
            <InfoField label="Email Address"  value="j.vane@digital-atelier.com" />
            <InfoField label="Phone"          value="+44 20 7946 0124" />
            <InfoField label="Member Since"   value="November 2023" />
          </div>

          {/* Style preferences */}
          <div className={styles.stylePrefs}>
            <h2 className={styles.stylePrefs__title}>Personal Style Preferences</h2>
            <div className={styles.stylePrefs__grid}>
              {STYLE_PREFERENCES.map((pref) => (
                <StyleCard key={pref.label} {...pref} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section className={styles.recs}>
        <div className={styles.recs__header}>
          <h2 className={styles.recs__title}>Curated Recommendations</h2>
          <a href="/wardrobe" className={styles.recs__link}>
            View Full Wardrobe
          </a>
        </div>
        <div className={styles.recs__grid}>
          {RECOMMENDED_ITEMS.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>

        <Footer />
    </div>
  );
};

export default ProfilePage;