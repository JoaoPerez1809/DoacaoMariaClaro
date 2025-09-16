import styles from './TitleBanner.module.css'; // 1. Importa o módulo CSS

type TitleBannerProps = {
  title: string;
};

export function TitleBanner({ title }: TitleBannerProps) {
  return (
    // 2. Usa os estilos do módulo
    <div className={styles.titleBanner}>
      <h1 className={styles.bannerTitle}>{title}</h1>
    </div>
  );
}
