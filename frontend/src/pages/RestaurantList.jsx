import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import KakaoMap from '../components/KakaoMap';
import { restaurantService } from '../services/restaurantService';
import { useFetch } from '../hooks/useFetch';
import styles from './RestaurantList.module.css';

const PRICE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'CHEAP', label: '🟢 1만원 이하' },
  { value: 'NORMAL', label: '🟡 1~3만원' },
  { value: 'EXPENSIVE', label: '🔴 3만원 이상' },
];

const ATMOSPHERE_OPTIONS = ['데이트', '가족', '혼밥', '비즈니스', '친구모임', '야외'];

function RestaurantList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState('');

  const keyword    = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const priceRange = searchParams.get('priceRange') || '';

  const { data: restaurantRes, loading } = useFetch(
    () => restaurantService.getList({
      page, size: 12,
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      priceRange: priceRange || undefined,
      atmosphere: selectedAtmosphere || undefined,
    }),
    [page, keyword, categoryId, priceRange, selectedAtmosphere],
  );

  // Spring Boot 3.3+: 페이지 정보가 res.data.page 안에 있음
  const restaurants = restaurantRes?.data?.content || [];
  const pageInfo = restaurantRes?.data?.page ?? restaurantRes?.data;
  const totalPages = pageInfo?.totalPages || 0;

  const handleSearch = (kw) => {
    setPage(0);
    setSearchParams(kw ? { keyword: kw } : {});
  };

  const handlePriceFilter = (value) => {
    setPage(0);
    const next = { ...Object.fromEntries(searchParams) };
    if (value) next.priceRange = value; else delete next.priceRange;
    setSearchParams(next);
  };

  const handleAtmosphere = (tag) => {
    setPage(0);
    setSelectedAtmosphere(prev => prev === tag ? '' : tag);
  };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className="page-title">맛집 탐색</h1>
        <div className={styles.topRow}>
          <SearchBar onSearch={handleSearch} />
          <div className={styles.viewToggle}>
            <button className={viewMode === 'grid' ? styles.activeView : ''} onClick={() => setViewMode('grid')}>그리드</button>
            <button className={viewMode === 'map'  ? styles.activeView : ''} onClick={() => setViewMode('map')}>지도</button>
          </div>
        </div>
        {keyword && <p className={styles.resultInfo}>"{keyword}" 검색 결과</p>}
      </div>

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        {/* 가격대 */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>가격대</span>
          {PRICE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={priceRange === opt.value ? styles.filterActive : styles.filterChip}
              onClick={() => handlePriceFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 분위기 */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>분위기</span>
          {ATMOSPHERE_OPTIONS.map(tag => (
            <button
              key={tag}
              className={selectedAtmosphere === tag ? styles.filterActive : styles.filterChip}
              onClick={() => handleAtmosphere(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'map' && (
        <div className={styles.mapWrapper}>
          <KakaoMap markers={restaurants} height="500px" />
        </div>
      )}

      {loading ? (
        <p className={styles.loading}>불러오는 중...</p>
      ) : restaurants.length === 0 ? (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={i === page ? styles.activePage : styles.pageBtn}
              onClick={() => setPage(i)}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantList;
