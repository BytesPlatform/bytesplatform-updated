import styles from "./MobileHeroProject.module.css";

export default function MobileHeroProject() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.blob}>
        <img
          src="/hero/mobile-blob-image.png"
          alt=""
          className={styles.image}
          draggable={false}
        />
      </div>
    </div>
  );
}
