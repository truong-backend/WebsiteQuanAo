// src/components/user/layout/PageLayout.tsx
// Wrapper layout chuẩn: Navbar trên, Footer dưới, main flex:1
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './PageLayout.module.scss';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => (
  <div className={[styles.layout, className].filter(Boolean).join(' ')}>
    <Navbar />
    <main className={styles.main}>
      {children}
    </main>
    <Footer />
  </div>
);

export default PageLayout;