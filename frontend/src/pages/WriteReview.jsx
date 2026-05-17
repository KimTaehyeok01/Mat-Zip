import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { restaurantService } from '../services/restaurantService';
import api from '../services/api';
import styles from './WriteReview.module.css';

function WriteReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ rating: 0, content: '', visitDate: '' });
  const [error, setError] = useState('');
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | checking | verified | failed
  const [userCoords, setUserCoords] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const receiptInputRef = useRef(null);

  useEffect(() => {
    restaurantService.getDetail(id).then((res) => setRestaurant(res.data));
  }, [id]);

  // GPS 위치 인증
  const handleGpsVerify = () => {
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('verified');
      },
      () => setGpsStatus('failed'),
      { timeout: 10000 }
    );
  };

  // 영수증 파일 선택
  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 가능합니다.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('파일 크기는 10MB 이하여야 합니다.'); return; }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { setError('별점을 선택해주세요.'); return; }
    setSubmitting(true);
    try {
      // 1. 리뷰 생성 (GPS 좌표 포함)
      const reviewRes = await restaurantService.createReview(id, {
        rating: form.rating,
        content: form.content,
        visitDate: form.visitDate || undefined,
        userLat: userCoords?.lat,
        userLng: userCoords?.lng,
      });

      // 2. 영수증 업로드 (선택)
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        await api.post(`/reviews/${reviewRes.data.id}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate(`/restaurants/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || '리뷰 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          리뷰 쓰기
          {restaurant && <span className={styles.restaurantName}> · {restaurant.name}</span>}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* 별점 */}
          <div className="form-group">
            <label>별점</label>
            <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={32} />
          </div>

          {/* 방문 날짜 */}
          <div className="form-group">
            <label>방문 날짜 (선택)</label>
            <input
              type="date"
              value={form.visitDate}
              onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* 리뷰 내용 */}
          <div className="form-group">
            <label>리뷰 내용 (선택)</label>
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="이 식당에 대한 솔직한 후기를 남겨주세요."
            />
          </div>

          {/* GPS 방문 인증 */}
          <div className={styles.verifySection}>
            <div className={styles.verifyHeader}>
              <span className={styles.verifyTitle}>📍 GPS 방문 인증</span>
              <span className={styles.verifyDesc}>식당 500m 이내에 있으면 인증됩니다</span>
            </div>
            {gpsStatus === 'idle' && (
              <button type="button" className={styles.verifyBtn} onClick={handleGpsVerify}>
                내 위치로 인증하기
              </button>
            )}
            {gpsStatus === 'checking' && <p className={styles.verifyChecking}>📡 위치 확인 중...</p>}
            {gpsStatus === 'verified' && <p className={styles.verifySuccess}>✅ 위치 인증 완료! 인증 리뷰로 등록됩니다.</p>}
            {gpsStatus === 'failed' && (
              <p className={styles.verifyFail}>❌ 위치 접근 실패 (인증 없이 등록됩니다)</p>
            )}
          </div>

          {/* 영수증 인증 */}
          <div className={styles.verifySection}>
            <div className={styles.verifyHeader}>
              <span className={styles.verifyTitle}>🧾 영수증 인증 (선택)</span>
              <span className={styles.verifyDesc}>영수증 사진을 첨부하면 인증 리뷰로 표시됩니다</span>
            </div>
            {!receiptFile ? (
              <button type="button" className={styles.verifyBtn} onClick={() => receiptInputRef.current?.click()}>
                영수증 사진 첨부
              </button>
            ) : (
              <div className={styles.receiptPreview}>
                <img src={receiptPreview} alt="영수증 미리보기" />
                <button type="button" className={styles.removeReceipt}
                  onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}>
                  ✕ 제거
                </button>
              </div>
            )}
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleReceiptChange}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.btnRow}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteReview;
