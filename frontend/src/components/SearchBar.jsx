import React, { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch, placeholder = '식당 이름, 주소로 검색' }) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit" className={`btn btn-primary ${styles.btn}`}>검색</button>
    </form>
  );
}

export default SearchBar;
