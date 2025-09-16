import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.contactInfo}>
        <a href="mailto:adm@mariaclara.org.br">adm@mariaclara.org.br</a>
        <span>(15) 98812-4427</span>
      </div>
    </div>
  );
}
