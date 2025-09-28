import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.contactInfo}>
        <a href="mailto:adm@mariaclara.org.br">adm@mariaclaro.org.br</a>
        <span>(15) 98812-4427</span>
        <a href="https://mariaclaro.org.br/como-ajudar">Doe</a>
      </div>
    </div>
  );
}
