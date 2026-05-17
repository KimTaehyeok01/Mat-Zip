import React from 'react';
import StarRating from './StarRating';
import styles from './ReviewCard.module.css';

const BADGES = {
  GPS:     { label: '📍 방문 인증', color: '#16a34a' },
  RECEIPT: { label: '🧾 영수증 인증', color: '#2563eb' },
  BOTH:    { label: '✅ 방문+영수증 인증', color: '#7c3aed' },
};

function ReviewCard({ review, onDelete, currentUserId }) {
  const { id, userNickname, userProfileImage, rating, content, visitDate,
          createdAt, verificationType, receiptImage } = review;
  const isOwner = currentUserId && review.userId === currentUserId;
  const badge = BADGES[verificationType];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          {userProfileImage
            ? <img src={userProfileImage} alt={userNickname} className={styles.avatar} />
            : <div className={styles.avatarDefault}>{userNickname?.[0]}</div>
          }
          <div>
            <p className={styles.nickname}>{userNickname}</p>
            {visitDate && <p className={styles.date}>방문일: {visitDate}</p>}
          </div>
        </div>
        <div className={styles.right}>
          <StarRating value={rating} size={16} />
          {isOwner && (
            <button className={styles.deleteBtn} onClick={() => onDelete(id)}>삭제</button>
          )}
        </div>
      </div>

      {/* 인증 배지 */}
      {badge && (
        <span className={styles.badge} style={{ color: badge.color, borderColor: badge.color }}>
          {badge.label}
        </span>
      )}

      {content && <p className={styles.content}>{content}</p>}

      {/* 영수증 이미지 */}
      {receiptImage && (
        <a href={receiptImage} target="_blank" rel="noopener noreferrer" className={styles.receipt}>
          <img src={receiptImage} alt="영수증" className={styles.receiptThumb} />
          <span>영수증 보기</span>
        </a>
      )}

      <p className={styles.createdAt}>{new Date(createdAt).toLocaleDateString('ko-KR')}</p>
    </div>
  );
}

export default ReviewCard;
