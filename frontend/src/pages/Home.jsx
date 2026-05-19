import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantService, categoryService } from '../services/restaurantService';
import { useFetch } from '../hooks/useFetch';
import styles from './Home.module.css';


function Home() {
  const navigate = useNavigate();
  const { data: topRatedRes } = useFetch(() => restaurantService.getTopRated(), []);
  const { data: categoriesRes } = useFetch(() => categoryService.getAll(), []);

  const topRated = topRatedRes?.data?.content || [];
  const categories = categoriesRes?.data || [];

  const handleSearch = (keyword) => {
    if (keyword) navigate(`/restaurants?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleCategory = (id) => {
    navigate(`/restaurants?categoryId=${id}`);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>우리 동네 맛집을 찾아보세요</h1>
        <p className={styles.heroSub}>카카오 지도와 함께하는 동네 맛집 플랫폼</p>
        <SearchBar onSearch={handleSearch} />
      </section>

      <section className={styles.section}>
        <h2 className="page-title">카테고리</h2>
        <div className={styles.categories}>
          {categories.map((c) => (
            <button key={c.id} className={styles.categoryBtn} onClick={() => handleCategory(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="page-title">⭐ 인기 맛집 TOP</h2>
        <div className="restaurant-grid">
          {topRated.slice(0, 8).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
