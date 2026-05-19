import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import KakaoMap from '../components/KakaoMap';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { restaurantService } from '../services/restaurantService';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useBookmark } from '../hooks/useBookmark';
import styles from './RestaurantDetail.module.css';

function RestaurantDetail() {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { bookmarked, setBookmarked, toggleBookmark } = useBookmark(id);

  useEffect(() => {
    restaurantService.getDetail(id).then((res) => {
      setRestaurant(res.data);
      setBookmarked(res.data.bookmarked);
    });
    restaurantService.getReviews(id).then((res) => setReviews(res.data.content || []));
  }, [id, setBookmarked]);

  const handleBookmark = toggleBookmark;

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제할까요?')) return;
    await api.delete(`/reviews/${reviewId}`);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  if (!restaurant) return <p className={styles.loading}>불러오는 중...</p>;

  const { name, address, phone, openingHours, categoryName, averageRating, reviewCount, latitude, longitude, description } = restaurant;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          {categoryName && <span className={styles.category}>{categoryName}</span>}
          <h1 className={styles.name}>{name}</h1>
          <div className={styles.ratingRow}>
            <StarRating value={Math.round(averageRating)} size={20} />
            <span>{Number(averageRating).toFixed(1)}</span>
            <span className={styles.muted}>({reviewCount}개 리뷰)</span>
          </div>
          <p className={styles.address}>📍 {address}</p>
          {phone && <p className={styles.info}>📞 {phone}</p>}
          {openingHours && <p className={styles.info}>🕐 {openingHours}</p>}
          {description && <p className={styles.desc}>{description}</p>}
        </div>
        <div className={styles.actions}>
          {isLoggedIn && (
            <>
              <button
                className={`btn ${bookmarked ? 'btn-primary' : 'btn-outline'}`}
                onClick={handleBookmark}
              >
                {bookmarked ? '★ 저장됨' : '☆ 저장'}
              </button>
              <Link to={`/restaurants/${id}/review`} className="btn btn-primary">리뷰 쓰기</Link>
            </>
          )}
        </div>
      </div>

      <div className={styles.mapSection}>
        <KakaoMap lat={parseFloat(latitude)} lng={parseFloat(longitude)} name={name} height="320px" />
      </div>

      <section className={styles.reviewSection}>
        <h2 className={styles.reviewTitle}>리뷰 {reviewCount}개</h2>
        {reviews.length === 0
          ? <p className={styles.empty}>아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!</p>
          : <div className={styles.reviewList}>
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onDelete={handleDeleteReview}
                  currentUserId={user?.id}
                />
              ))}
            </div>
        }
      </section>
    </div>
  );
}

export default RestaurantDetail;
