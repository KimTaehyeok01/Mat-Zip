import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import styles from './RestaurantCard.module.css';

function RestaurantCard({ restaurant }) {
  const { id, name, address, categoryName, averageRating, reviewCount, imageUrls } = restaurant;
  const thumbnail = imageUrls?.[0];

  return (
    <Link to={`/restaurants/${id}`} className={`card ${styles.card}`}>
      <div className={styles.image}>
        {thumbnail
          ? <img src={thumbnail} alt={name} />
          : <div className={styles.noImage}>🍽</div>
        }
        {categoryName && <span className={styles.badge}>{categoryName}</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.address}>{address}</p>
        <div className={styles.rating}>
          <StarRating value={Math.round(averageRating)} size={16} />
          <span className={styles.ratingText}>
            {Number(averageRating).toFixed(1)} ({reviewCount}개 리뷰)
          </span>
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;
