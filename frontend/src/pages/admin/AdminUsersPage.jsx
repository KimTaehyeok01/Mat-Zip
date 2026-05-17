import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { adminService } from '../../services/adminService';
import styles from './AdminUsersPage.module.css';

function AdminUsersPage() {
  const { user, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'ROLE_ADMIN') navigate('/');
  }, [isLoggedIn, user, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        keyword: keyword || undefined,
        page,
        size: 15,
        sort: 'createdAt,desc',
      });
      setUsers(res.data.content ?? []);
      // Spring Boot 3.3+: 페이지 정보가 res.data.page 안에 있음
      const pageInfo = res.data.page ?? res.data;
      setTotalPages(pageInfo.totalPages ?? 0);
      setTotalElements(pageInfo.totalElements ?? 0);
    } catch {
      alert('회원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  const handleRoleToggle = async (targetUser) => {
    const isAdmin = targetUser.role === 'ROLE_ADMIN';
    const label = isAdmin ? '일반 사용자' : '관리자';
    if (!window.confirm(`"${targetUser.nickname}"의 역할을 ${label}로 변경할까요?`)) return;
    try {
      const res = await adminService.updateUser(targetUser.id, {
        role: isAdmin ? 'ROLE_USER' : 'ROLE_ADMIN',
      });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? res.data : u)));
    } catch {
      alert('역할 변경에 실패했습니다.');
    }
  };

  const handleActiveToggle = async (targetUser) => {
    const action = targetUser.active ? '비활성화' : '활성화';
    if (!window.confirm(`"${targetUser.nickname}" 회원을 ${action}할까요?`)) return;
    try {
      const res = await adminService.updateUser(targetUser.id, { active: !targetUser.active });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? res.data : u)));
    } catch {
      alert(`${action}에 실패했습니다.`);
    }
  };

  const handleDelete = async (targetUser) => {
    if (
      !window.confirm(
        `"${targetUser.nickname}" 회원을 탈퇴 처리할까요?\n리뷰, 북마크 등 모든 데이터가 삭제됩니다.`
      )
    )
      return;
    try {
      await adminService.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setTotalElements((n) => n - 1);
    } catch {
      alert('탈퇴 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('ko-KR') : '-';

  const providerLabel = (provider) =>
    ({ kakao: '카카오', naver: '네이버', local: '이메일' }[provider] ?? provider);

  // 페이지네이션 버튼 범위 계산
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
        <button
          className={`${styles.navBtn} ${styles.navBtnActive}`}
          onClick={() => navigate('/admin/users')}
        >
          👥 회원 관리
        </button>
        <button className={styles.navBtn} onClick={() => navigate('/admin/restaurants')}>
          🍽 맛집 관리
        </button>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageTitleRow}>
          <h1 className={styles.title}>회원 관리</h1>
          <span className={styles.totalCount}>총 {totalElements}명</span>
        </div>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="이메일 또는 닉네임으로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            검색
          </button>
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
                  <th>이메일</th>
                  <th>닉네임</th>
                  <th>가입방법</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={!u.active ? styles.inactiveRow : ''}>
                      <td className={styles.idCell}>{u.id}</td>
                      <td className={styles.emailCell} title={u.email}>
                        {u.email ?? '-'}
                      </td>
                      <td className={styles.nicknameCell}>{u.nickname}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`provider_${u.provider}`]}`}>
                          {providerLabel(u.provider)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${styles.roleBtn} ${
                            u.role === 'ROLE_ADMIN' ? styles.roleBtnAdmin : styles.roleBtnUser
                          }`}
                          onClick={() => handleRoleToggle(u)}
                          title="클릭하여 역할 변경"
                        >
                          {u.role === 'ROLE_ADMIN' ? '관리자' : '일반'}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`${styles.activeBtn} ${
                            u.active ? styles.activeBtnOn : styles.activeBtnOff
                          }`}
                          onClick={() => handleActiveToggle(u)}
                          title="클릭하여 상태 변경"
                        >
                          {u.active ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className={styles.dateCell}>{formatDate(u.createdAt)}</td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(u)}
                        >
                          탈퇴
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className={styles.cardList}>
            {users.length === 0 ? (
              <div className={styles.empty}>회원이 없습니다.</div>
            ) : (
              users.map((u) => (
                <div key={u.id} className={`${styles.card} ${!u.active ? styles.cardInactive : ''}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardAvatar}>
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.nickname} />
                      ) : (
                        <span>{u.nickname?.[0]}</span>
                      )}
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardNickname}>{u.nickname}</div>
                      <div className={styles.cardEmail}>{u.email ?? '-'}</div>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.badge} ${styles[`provider_${u.provider}`]}`}>
                          {providerLabel(u.provider)}
                        </span>
                        <span className={styles.cardDate}>{formatDate(u.createdAt)} 가입</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.roleBtn} ${
                        u.role === 'ROLE_ADMIN' ? styles.roleBtnAdmin : styles.roleBtnUser
                      }`}
                      onClick={() => handleRoleToggle(u)}
                    >
                      {u.role === 'ROLE_ADMIN' ? '관리자' : '일반'}
                    </button>
                    <button
                      className={`${styles.activeBtn} ${
                        u.active ? styles.activeBtnOn : styles.activeBtnOff
                      }`}
                      onClick={() => handleActiveToggle(u)}
                    >
                      {u.active ? '활성' : '비활성'}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(u)}>
                      탈퇴
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(0)} title="첫 페이지">«</button>
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)} title="이전 페이지">‹</button>

              {getPageRange()[0] > 0 && <span className={styles.pageDots}>…</span>}

              {getPageRange().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              ))}

              {getPageRange().at(-1) < totalPages - 1 && <span className={styles.pageDots}>…</span>}

              <button className={styles.pageBtn} disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} title="다음 페이지">›</button>
              <button className={styles.pageBtn} disabled={page === totalPages - 1} onClick={() => setPage(totalPages - 1)} title="마지막 페이지">»</button>

              <span className={styles.pageInfo}>{page + 1} / {totalPages} 페이지</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUsersPage;