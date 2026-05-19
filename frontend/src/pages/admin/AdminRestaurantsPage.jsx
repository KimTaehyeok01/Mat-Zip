import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/restaurantService';
import styles from './AdminRestaurantsPage.module.css';

const EMPTY_FORM = {
  name: '', description: '', address: '', roadAddress: '',
  latitude: '', longitude: '', phone: '', website: '',
  openingHours: '', categoryId: '', kakaoPlaceId: '',
  priceRange: '', atmosphere: '',
};

const PRICE_OPTIONS = [
  { value: '', label: '가격대 선택' },
  { value: 'CHEAP',     label: '저렴 (1만원↓)' },
  { value: 'NORMAL',    label: '보통 (1~3만원)' },
  { value: 'EXPENSIVE', label: '고가 (3만원↑)' },
];

function AdminRestaurantsPage() {
  const { user, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = 신규
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'ROLE_ADMIN') navigate('/');
  }, [isLoggedIn, user, navigate]);

  // 카테고리 1회 로드
  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data ?? [])).catch(() => {});
  }, []);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getRestaurants({
        keyword: keyword || undefined,
        page,
        size: 15,
        sort: 'createdAt,desc',
      });
      setRestaurants(res.data.content ?? []);
      const pageInfo = res.data.page ?? res.data;
      setTotalPages(pageInfo.totalPages ?? 0);
      setTotalElements(pageInfo.totalElements ?? 0);
    } catch {
      alert('맛집 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  // 모달 열기 (신규)
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  // 모달 열기 (수정)
  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name ?? '',
      description: r.description ?? '',
      address: r.address ?? '',
      roadAddress: r.roadAddress ?? '',
      latitude: r.latitude ?? '',
      longitude: r.longitude ?? '',
      phone: r.phone ?? '',
      website: r.website ?? '',
      openingHours: r.openingHours ?? '',
      categoryId: r.categoryId ?? '',
      kakaoPlaceId: r.kakaoPlaceId ?? '',
      priceRange: r.priceRange ?? '',
      atmosphere: r.atmosphere ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.latitude || !form.longitude) {
      alert('이름, 주소, 위도, 경도는 필수 입력 항목입니다.');
      return;
    }
    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await adminService.updateRestaurant(editingId, payload);
        setRestaurants((prev) => prev.map((r) => (r.id === editingId ? res.data : r)));
      } else {
        const res = await adminService.createRestaurant(payload);
        setRestaurants((prev) => [res.data, ...prev]);
        setTotalElements((n) => n + 1);
      }
      closeModal();
    } catch {
      alert(editingId ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r) => {
    if (
      !window.confirm(
        `"${r.name}"을(를) 삭제할까요?\n관련 리뷰, 북마크 데이터도 함께 삭제됩니다.`
      )
    )
      return;
    try {
      await adminService.deleteRestaurant(r.id);
      setRestaurants((prev) => prev.filter((item) => item.id !== r.id));
      setTotalElements((n) => n - 1);
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ko-KR') : '-');

  const priceLabel = (v) =>
    ({ CHEAP: '저렴', NORMAL: '보통', EXPENSIVE: '고가' }[v] ?? '-');

  // 페이지네이션 버튼 범위 계산 (현재 페이지 기준 최대 5개 표시)
  const getPageRange = () => {
    const delta = 2;
    const start = Math.max(0, Math.min(page - delta, totalPages - 5));
    const end = Math.min(totalPages - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className={styles.container}>
      {/* 관리자 탭 네비 */}
      <div className={styles.adminNav}>
        <button className={styles.navBtn} onClick={() => navigate('/admin/users')}>
          👥 회원 관리
        </button>
        <button
          className={`${styles.navBtn} ${styles.navBtnActive}`}
          onClick={() => navigate('/admin/restaurants')}
        >
          🍽 맛집 관리
        </button>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleRow}>
          <h1 className={styles.title}>맛집 관리</h1>
          <span className={styles.totalCount}>총 {totalElements}개</span>
        </div>
        <div className={styles.headerRight}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="식당명 또는 주소로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">검색</button>
            {keyword && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setSearchInput(''); setKeyword(''); setPage(0); }}
              >
                초기화
              </button>
            )}
          </form>
          <button className="btn btn-primary" onClick={openCreate}>+ 새 맛집 추가</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : (
        <>
          {/* 테이블 (데스크탑) */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>카테고리</th>
                  <th>주소</th>
                  <th>평점</th>
                  <th>리뷰</th>
                  <th>가격대</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={styles.empty}>
                      등록된 맛집이 없습니다.
                    </td>
                  </tr>
                ) : (
                  restaurants.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.idCell}>{r.id}</td>
                      <td className={styles.nameCell} title={r.name}>{r.name}</td>
                      <td>{r.categoryName ?? '-'}</td>
                      <td className={styles.addressCell} title={r.address}>{r.address}</td>
                      <td>
                        <span className={styles.rating}>
                          ⭐ {r.averageRating != null ? Number(r.averageRating).toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className={styles.countCell}>{r.reviewCount ?? 0}</td>
                      <td>{priceLabel(r.priceRange)}</td>
                      <td className={styles.dateCell}>{formatDate(r.createdAt)}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => openEdit(r)}>
                            수정
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(r)}>
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className={styles.cardList}>
            {restaurants.length === 0 ? (
              <div className={styles.empty}>등록된 맛집이 없습니다.</div>
            ) : (
              restaurants.map((r) => (
                <div key={r.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardName}>{r.name}</div>
                    <div className={styles.cardMeta}>
                      {r.categoryName && <span className={styles.catBadge}>{r.categoryName}</span>}
                      <span>⭐ {r.averageRating != null ? Number(r.averageRating).toFixed(1) : '-'}</span>
                      <span>리뷰 {r.reviewCount ?? 0}</span>
                      {r.priceRange && <span>{priceLabel(r.priceRange)}</span>}
                    </div>
                    <div className={styles.cardAddress}>{r.address}</div>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={() => openEdit(r)}>수정</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(r)}>삭제</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {/* 첫 페이지 */}
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(0)} title="첫 페이지">«</button>
              {/* 이전 페이지 */}
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)} title="이전 페이지">‹</button>

              {/* 앞 생략 */}
              {getPageRange()[0] > 0 && (
                <span className={styles.pageDots}>…</span>
              )}

              {/* 페이지 번호 */}
              {getPageRange().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              ))}

              {/* 뒤 생략 */}
              {getPageRange().at(-1) < totalPages - 1 && (
                <span className={styles.pageDots}>…</span>
              )}

              {/* 다음 페이지 */}
              <button className={styles.pageBtn} disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} title="다음 페이지">›</button>
              {/* 마지막 페이지 */}
              <button className={styles.pageBtn} disabled={page === totalPages - 1} onClick={() => setPage(totalPages - 1)} title="마지막 페이지">»</button>

              <span className={styles.pageInfo}>{page + 1} / {totalPages} 페이지</span>
            </div>
          )}
        </>
      )}

      {/* ── 맛집 추가/수정 모달 ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? '맛집 정보 수정' : '새 맛집 추가'}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {/* 이름 */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>이름 *</label>
                  <input name="name" value={form.name} onChange={handleFormChange}
                    className={styles.input} placeholder="맛집 이름" required />
                </div>

                {/* 주소 */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>주소 *</label>
                  <input name="address" value={form.address} onChange={handleFormChange}
                    className={styles.input} placeholder="지번 주소" required />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>도로명 주소</label>
                  <input name="roadAddress" value={form.roadAddress} onChange={handleFormChange}
                    className={styles.input} placeholder="도로명 주소" />
                </div>

                {/* 위도/경도 */}
                <div className={styles.field}>
                  <label className={styles.label}>위도 *</label>
                  <input name="latitude" type="number" step="any" value={form.latitude}
                    onChange={handleFormChange} className={styles.input} placeholder="37.5665" required />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>경도 *</label>
                  <input name="longitude" type="number" step="any" value={form.longitude}
                    onChange={handleFormChange} className={styles.input} placeholder="126.9780" required />
                </div>

                {/* 카테고리 / 가격대 */}
                <div className={styles.field}>
                  <label className={styles.label}>카테고리</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleFormChange}
                    className={styles.select}>
                    <option value="">카테고리 선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>가격대</label>
                  <select name="priceRange" value={form.priceRange} onChange={handleFormChange}
                    className={styles.select}>
                    {PRICE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* 전화 / 웹사이트 */}
                <div className={styles.field}>
                  <label className={styles.label}>전화번호</label>
                  <input name="phone" value={form.phone} onChange={handleFormChange}
                    className={styles.input} placeholder="02-1234-5678" />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>웹사이트</label>
                  <input name="website" value={form.website} onChange={handleFormChange}
                    className={styles.input} placeholder="https://..." />
                </div>

                {/* 영업시간 */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>영업시간</label>
                  <input name="openingHours" value={form.openingHours} onChange={handleFormChange}
                    className={styles.input} placeholder="11:00 - 22:00" />
                </div>

                {/* 분위기 태그 */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>분위기 태그</label>
                  <input name="atmosphere" value={form.atmosphere} onChange={handleFormChange}
                    className={styles.input} placeholder="데이트,가족,혼밥 (쉼표로 구분)" />
                </div>

                {/* 설명 */}
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>설명</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange}
                    className={styles.textarea} rows={3} placeholder="맛집 설명" />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '저장 중...' : editingId ? '수정 완료' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurantsPage;
