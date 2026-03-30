// src/pages/AboutPage.tsx
// Moved from: src/pages/user/AboutPage.tsx
// Static content page — không đổi import nào
import { useNavigate } from "react-router-dom";
import PageLayout from "@/layouts/user/PageLayout";
import styles from "./AboutPage.module.scss";

const PILLARS = [
  {
    title: "Minh bạch tuyệt đối",
    body: "Chúng tôi truy xuất nguồn gốc từng sản phẩm — từ nhà máy dệt đến tay bạn. Bền vững không phải mục tiêu; đó là nền tảng.",
  },
  {
    title: "Kỹ thuật lưu truyền",
    body: "Kết hợp nghề may gia truyền với công nghệ hiện đại. Các mẫu thiết kế được tạo ra để vượt thời gian — cả về kết cấu lẫn thẩm mỹ.",
  },
  {
    title: "Dáng vẻ hiện đại",
    body: "Kiến trúc cho cơ thể. Chúng tôi khám phá mối quan hệ giữa chuyển động và hình học, tạo ra những trang phục thích ứng với nhịp sống của bạn.",
  },
];

const BENTO_SIDE = [
  {
    title: "Hoàn thiện thủ công",
    imgAlt: "Artisan hands sewing delicate fabric",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJvkc-u5Dp-XS23gEG0ADMcsgT0EZnKHIM4DEUxC5bbQq-qbM1qC6xlBiUrfJGhdbpwYxBcofRTNIyhRpNjSkxEcd6zn7oN5nAmVF-K8XwLHku_hHW1JQ-qjUH8t-xSN_nKfLJvysWX-_Q8gGocrbbodmOnO0AKcBp4uqg3L4AhqfIHeqJmPbqIITDr_UK1VBjaLGAHn5ficvXjjpS5Bast4J75OdvM6Ez9poWTlPv5vgclShoaQOt5faouVo_xWI9utxcP0E67A",
  },
  {
    title: "Thành phẩm hoàn hảo",
    imgAlt: "Row of minimalist white shirts in atelier",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHCyT0GITYExxzw1BdH77HZDMDGu0jukELmsXOa9JjZT9zIdkqQpX8I3Lx9rwxVbTJudDnR23MtGADJi8Ff5sxdffoXSdqtHH-4JUtA9qI0wyUfIodXYbd7ki3wQj3-8InKbUXt-ODryrLtWHpvNzpDugQZLLfIz1Nqh4AMIk_GuFrw6jKSrF4vXC4e7KHdotKFHKhx6RjWhTPUMKXBC1ZhA9E9GVOiNlkgQngDJ3sxuEs_xI2JXTslmZ1shToEN31Pei69Ndic4Q",
  },
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.hero__bg}>
            <img
              className={styles.hero__img}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtNGSUR4MhM69_yiAIoND3hj7LgQMYXiDbMIxu9_soPGa8viuGD4xhGMaryj4y-3_vpm917AEEM7vfdxeE6-elKDX1xGTh4ZKDCdj92m31dj48gtCKiojnGZZd0dZtJCIOiS09nfs-DWwW-aE_sZhT7drzq_cHNBvLyEKon2utodfCtOTptcPX2oQFwt7T-rICJMN6Xjp1eAyUHEPUKPV6JnUFKX7w47xQKvYXqYe5-BrBzmJqdlE463PNW4tkVOfNHGaqe4x9zGY"
              alt="Minimalist fashion photography"
            />
            <div className={styles.hero__fade} />
          </div>
          <div className={styles.hero__content}>
            <h1 className={styles.hero__title}>
              Định nghĩa khoảng trống <br />
              giữa <em>tĩnh lặng</em> &amp; <em>kiến trúc.</em>
            </h1>
            <p className={styles.hero__lead}>
              ShopVN là nơi trú ẩn cho những ai tìm kiếm vẻ đẹp trong sự tinh
              giản. Chúng tôi mang đến những trang phục vượt thời gian cho người
              hiện đại đầy suy nghĩ.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className={styles.story}>
          <div className={styles.story__grid}>
            <div>
              <span className={styles.story__eyebrow}>
                Câu chuyện của chúng tôi
              </span>
              <h2 className={styles.story__title}>
                Nghệ thuật của
                <br />
                Xa xỉ Im Lặng
              </h2>
              <div className={styles.story__body}>
                <p>
                  Được thành lập từ niềm đam mê thời trang bền vững, ShopVN ra
                  đời như một phản ứng trước thế giới thời trang nhanh ồn ào.
                </p>
                <p>
                  Chúng tôi tin rằng xa xỉ không phải là tuyên ngôn; đó là tiếng
                  thì thầm. Là đường may ẩn, viền hoàn thiện tay, và sự tự tin
                  thầm lặng của một bộ trang phục tồn tại để phục vụ người mặc,
                  không phải xu hướng.
                </p>
              </div>
            </div>
            <div className={styles.story__imgWrap}>
              <img
                className={styles.story__img}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCisogKodrwcsFXhxQbhMUXLx9qOJrZwCn0BH1MlTyL8ukm-WmHwgI26yKusG650OVIVCO9AwkXeu4aDzczbSdD_UGC5vi_trtrJfo2UBlQ9ujSWJHyu8TD7ip-PXPmIfhgM4TCcoqWPCiMUZt9CjBJoLXXPrTn1U_uvRyxXR1FqkZ9EYSfErlhh5FaZUhUWqX7-WRTBJYXTCxmrh0rt-7uW7AEgRLNLZNc-XuLsv00gAtVZPYSSPELw8Ol3wzaE0PJRXGTAiHSR6A"
                alt="High quality fabric texture"
              />
              <div className={styles.story__imgCaption}>
                <p>Mảnh 04: Sự căng thẳng giữa vải lanh thô và len cấu trúc.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className={styles.philosophy}>
          <div className={styles.philosophy__inner}>
            {PILLARS.map((p) => (
              <div key={p.title} className={styles.pillar}>
                <h3 className={styles.pillar__title}>{p.title}</h3>
                <p className={styles.pillar__body}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Artisans bento */}
        <section className={styles.artisans}>
          <div className={styles.artisans__inner}>
            <div className={styles.artisans__header}>
              <h2 className={styles.artisans__title}>
                Bàn tay của <em>Xưởng may</em>
              </h2>
              <p className={styles.artisans__quote}>
                "Một bộ trang phục chỉ đẹp bằng tinh thần của người đã tạo ra
                nó."
              </p>
            </div>
            <div className={styles.bentoGrid}>
              <div className={styles.bentoMain}>
                <img
                  className={styles.bentoMain__img}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjQP_us8nu6Fbqn6TgoZ4zx0kEW6RxAb3r1d-6-IXIrqweuhnY2XMjLS-3tZ-n8I1Q3h8-TFtxNcVyDeCA3DdbBmTeZAxhJNNnAvo_qLIRJekt0pq-424WRqu8r2rUOKBWEDotjSlOIr2zcpmSav4Hj_f_k0RdSdSvFoHtRQ4AgqFHMcuAKrMrTG1Db3gOxaWHWoD0fJd2HP4Tt9F5IyNkxeZIYdgN_P9KMAQt5oUR3xj6PmMk3bM4cjFI4JjNO6LRKBTUIpwNGvw"
                  alt="Master tailor working in studio"
                />
                <div className={styles.bentoMain__overlay}>
                  <h4 className={styles.bentoMain__title}>Bàn cắt may</h4>
                  <p className={styles.bentoMain__sub}>
                    May đo &amp; Tạo mẫu bậc thầy
                  </p>
                </div>
              </div>
              <div className={styles.bentoSide}>
                {BENTO_SIDE.map((item) => (
                  <div key={item.title} className={styles.bentoSmall}>
                    <img
                      className={styles.bentoSmall__img}
                      src={item.img}
                      alt={item.imgAlt}
                    />
                    <div className={styles.bentoSmall__overlay}>
                      <h4 className={styles.bentoSmall__title}>{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statement CTA */}
        <section className={styles.statement}>
          <div className={styles.statement__inner}>
            <h2 className={styles.statement__quote}>
              Một tủ quần áo bền vững là hình thức tự trọng.
            </h2>
            <div className={styles.statement__line} />
            <p className={styles.statement__sub}>
              Tham gia hành trình của sự chủ tâm
            </p>
            <button
              className={styles.statement__btn}
              onClick={() => navigate("/products")}
            >
              Khám phá bộ sưu tập
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
