import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantService, categoryService } from '../services/restaurantService';
import { useFetch } from '../hooks/useFetch';
import styles from './Home.module.css';

const CATEGORY_ICONS = {
  '한식': '🍚',
  '중식': '🥢',
  '일식': '🍣',
  '양식': '🍝',
  '분식': '🥙',
  '카페': '☕',
  '패스트푸드': '🍔',
  '기타': '🍽️',
};

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

      {/* 히어로 */}
      <section className={styles.hero}>
        <span className={styles.heroEyebrow}>🍽️ 동네 맛집 플랫폼</span>
        <h1 className={styles.heroTitle}>
          우리 동네 <em>맛집</em>을<br />찾아보세요
        </h1>
        <p className={styles.heroSub}>별점·리뷰·지도로 검증된 맛집 정보</p>
        <div className={styles.heroSearchWrap}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* 카테고리 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>카테고리</h2>
            <p className={styles.sectionSub}>원하는 음식 종류를 선택해보세요</p>
          </div>
        </div>
        <div className={styles.categories}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={styles.categoryCard}
              onClick={() => handleCategory(c.id)}
            >
              <span className={styles.categoryIcon}>
                {CATEGORY_ICONS[c.name] || '🍽️'}
              </span>
              <span className={styles.categoryName}>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 인기 맛집 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>⭐ 인기 맛집 TOP</h2>
            <p className={styles.sectionSub}>높은 별점을 받은 검증된 맛집</p>
          </div>
        </div>
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
