// src/pages/user/ProfilePage.tsx
// Trang cá nhân user — thiết kế theo The Atelier style
// Dùng trong ProfileLayout (sidebar + main đã có sẵn)

import React from 'react';
import styles from './ProfilePage.module.scss';
import ProfileLayout from '@/components/user/layout/ProfileLayout';

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


// ─── Page ─────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  return (
    <ProfileLayout>     <div className={styles.page}>
      <header className={styles.pageHeader}>
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
            <InfoField label="Address Home" value="HCM" />
            {/* <InfoField label="Member Since"   value="November 2023" /> */}
          </div>

        </div>
      </section>
    </div></ProfileLayout>

  );
};

export default ProfilePage;