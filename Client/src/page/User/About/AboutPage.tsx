// src/pages/User/About/AboutPage.tsx
import React from "react";
import styles from "./AboutPage.module.scss";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";

const AboutPage: React.FC = () => {
  return (

    <PageLayout>
      <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Về Chúng Tôi</h1>
        <p>
          Chúng tôi mang đến những sản phẩm thời trang chất lượng, hiện đại và phù hợp với mọi phong cách.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Sứ mệnh</h2>
        <p>
          Mang đến trải nghiệm mua sắm tốt nhất cho khách hàng với sản phẩm chất lượng cao,
          giá cả hợp lý và dịch vụ tận tâm.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Tầm nhìn</h2>
        <p>
          Trở thành thương hiệu thời trang hàng đầu tại Việt Nam, được khách hàng tin tưởng và yêu thích.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Giá trị cốt lõi</h2>
        <ul>
          <li>✔ Chất lượng sản phẩm</li>
          <li>✔ Uy tín & minh bạch</li>
          <li>✔ Khách hàng là trung tâm</li>
          <li>✔ Đổi mới & sáng tạo</li>
        </ul>
      </div>
    </div>
    </PageLayout>
  );
};

export default AboutPage;