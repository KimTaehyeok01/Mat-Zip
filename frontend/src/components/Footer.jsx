import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>🍽 맛집</p>
        <p className={styles.copy}>© 2026 맛집. 동네 맛집 플랫폼.</p>
      </div>
    </footer>
  );
}

export default Footer;
