// src/pages/user/OrderHistoryPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderHistoryPage.module.scss';

// ─── Types ─────────────────────────────────────────────────────
type OrderStatus = 'Shipped' | 'Delivered';

interface Order {
  id: string;
  name: string;
  date: string;
  status: OrderStatus;
  total: string;
  img: string;
  imgAlt: string;
}

// ─── Data ──────────────────────────────────────────────────────
const ORDERS: Order[] = [
  {
    id:     '#AT-10294',
    name:   'The Monochrome Overcoat',
    date:   'Purchased on Oct 24, 2023',
    status: 'Shipped',
    total:  '$1,240.00',
    img:    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxLlepKT7Mde270kH5_QgU1bjfvICGZVZxectJlKlzLEcmXlE-opfalvdUzr4F_JmmLgkoqAY8W3ofoB6p_OtxvlSvmykYJ2AfLrE9KtwTDEZlkLQJtKKxFM6kfyauIC2FC1eqlLpQOVSY4aPDntXglAp57LtwweOltZJoeX_X6ZZrsaDmw_INAP9CeXwPr5s3hCBGb0_6qnBF5f8RiKsW_3SKN5WFA7BetaZvVyMQgB5BtgvOwRlz4X_mutYr4BkHzH71ryHnmbg',
    imgAlt: 'Minimalist high quality winter coat photo',
  },
  {
    id:     '#AT-09882',
    name:   'Selvedge Edge Denim',
    date:   'Purchased on Sept 12, 2023',
    status: 'Delivered',
    total:  '$450.00',
    img:    'https://lh3.googleusercontent.com/aida-public/AB6AXuD100YpkPLea3suIXZxNrypJdI21I3senCQl1lCCa8PbtIBVjpqClRrRHEzRu5-dgDc4JBb8esIOV_tlmbunWQGvv-Tj_UTJZGY2jZtpePmupB1uLFZ9gHZGj8XQkpMTPrct7yNyD--yFXGvrLVRLo_U8a0JPDcGB0_D1cyJf7aSIkEReKNkDnAyU49vutC5oCjoYnWkvg0UfDBVqM7EaHgwKnp_01bpdVsap1G1euCcxRCPoiJXz9ln3mEBoBDbwE9xdE9kWrsaFA',
    imgAlt: 'Premium folded blue raw denim jeans',
  },
  {
    id:     '#AT-09121',
    name:   'Hand-Rolled Silk Square',
    date:   'Purchased on Aug 05, 2023',
    status: 'Delivered',
    total:  '$280.00',
    img:    'https://lh3.googleusercontent.com/aida-public/AB6AXuC7g9RswGOYIVRiiDvK-g4Dn9-0lOPOI5ik1EAAumnkriTw5zYninE_VFarmnA5X3r_Z_BA_qN36Y3jtKNmg0auXaWAVELWIYTcV5o_ohEPHHCWKV8D23HttoWG66cp0eJptUoAwlwvKNlWi99ACmOtjMsqgD6LJTV-h4V5Rg0KYhM1tThtJZQXyDESjPvoVS-ppoUrYLXOqnNbI_o7pwfhfaHWmZ8Jo94tDKBDlv_F5XAyUJn5mny3DuzRK-z9yymsO4T_oZKnxMY',
    imgAlt: 'Elegant black silk textile hanging',
  },
];

const CARE_TIPS = [
  {
    icon:  'dry_cleaning',
    title: 'Natural Fibers',
    desc:  'Wool and silk require minimal washing. Air your garments after wear and professional dry clean only when necessary.',
  },
  {
    icon:  'inventory_2',
    title: 'Seasonal Storage',
    desc:  'Store knitwear folded, not hanging, to maintain structural integrity. Use cedar blocks to naturally protect against moisture.',
  },
];

const SIDEBAR_LINKS = [
  { icon: 'person',        label: 'Profile',          to: '/profile'   },
  { icon: 'package_2',     label: 'Order History',    to: '/orders/history', active: true },
  { icon: 'favorite',      label: 'Wishlist',         to: '#'          },
  { icon: 'location_on',   label: 'Addresses',        to: '#'          },
  { icon: 'credit_card',   label: 'Payment Methods',  to: '#'          },
];

// ─── Component ─────────────────────────────────────────────────
const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <h2>Account</h2>
          <p>Managing your bespoke collection</p>
        </div>
        <nav className={styles.sidebarNav}>
          {SIDEBAR_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className={`${styles.navLink} ${link.active ? styles.active : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(link.to); }}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <section className={styles.content}>
        <div className={styles.inner}>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1>Order History</h1>
            <p>Review and track your recent acquisitions from the Atelier. Each piece is crafted with intentionality and delivered with care.</p>
          </div>

          {/* Orders List */}
          <div className={styles.ordersList}>
            {ORDERS.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderLeft}>
                  <div className={styles.orderThumb}>
                    <img src={order.img} alt={order.imgAlt} />
                  </div>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>ID: {order.id}</span>
                    <h3>{order.name}</h3>
                    <p className={styles.orderDate}>{order.date}</p>
                  </div>
                </div>

                <div className={styles.orderRight}>
                  <div className={styles.orderMeta}>
                    <p className={styles.metaLabel}>Status</p>
                    <span className={`${styles.badge} ${order.status === 'Shipped' ? styles.shipped : styles.delivered}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className={styles.orderMeta}>
                    <p className={styles.metaLabel}>Total</p>
                    <p className={styles.metaValue}>{order.total}</p>
                  </div>
                  <button
                    className={order.status === 'Shipped' ? styles.btnPrimary : styles.btnOutline}
                    onClick={() => navigate(`/orders/${order.id.replace('#', '')}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Asymmetric Grid */}
          <div className={styles.bottomGrid}>

            {/* Care Tips */}
            <div className={styles.careSection}>
              <h2>Garment Longevity</h2>
              <div className={styles.careGrid}>
                {CARE_TIPS.map((tip) => (
                  <div key={tip.title} className={styles.careCard}>
                    <span className={`material-symbols-outlined ${styles.careIcon}`}>{tip.icon}</span>
                    <h4>{tip.title}</h4>
                    <p>{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Visit */}
            <div className={styles.nextSection}>
              <h2>For Your Next Visit</h2>
              <div className={styles.nextCard}>
                <div className={styles.nextCardInner}>
                  <div className={styles.nextThumb}>
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7Tj7xyr7k-0yE_ZOz3HKtz9xSg_COuFTh4zEQtziWJMIcn4Se7J84AvCC-JQNrYMZnaqZwY6u2xzQmUubX9-8c7QTG55etG0TOOWjzGpNVzDftbgRizoP-aegc82op2Y4tvNlDaw-jTNgIWGOeEPvvACsxYJvUokHiW_RoJXSJ9yAcgtrbaj36TheD_HEUiVOeA_f6hjGS0bJwYu0zKfEHW2cvVhi00rdPH1Ye_dC6Koko0FOHdKnZQQ3QEIuarJRjSBSKDGNwdU"
                      alt="High-end structured black leather tote bag"
                    />
                  </div>
                  <div className={styles.nextInfo}>
                    <div>
                      <h4>The Sculpted Tote</h4>
                      <p className={styles.nextSubtitle}>Calfskin Leather</p>
                    </div>
                    <p className={styles.nextPrice}>$890.00</p>
                  </div>
                </div>
                <button className={styles.addBtn}>
                  <span className={`material-symbols-outlined ${styles.addIcon}`}>add</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderHistoryPage;