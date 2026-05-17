import React, { useEffect, useRef } from 'react';

const CLIENT_ID = process.env.REACT_APP_NAVER_MAP_KEY;

function loadNaverMapScript() {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID) {
      console.error('[NaverMap] REACT_APP_NAVER_MAP_KEY가 설정되지 않았습니다. .env 파일을 확인하고 React를 재시작하세요.');
      reject(new Error('CLIENT_ID missing'));
      return;
    }

    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    if (document.getElementById('naver-map-script')) {
      const interval = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('[NaverMap] 스크립트 로드 실패. ncpKeyId:', CLIENT_ID);
      reject(new Error('Script load failed'));
    };
    document.head.appendChild(script);
  });
}

function NaverMap({ lat, lng, name, markers = [], onMarkerClick, height = '400px' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadNaverMapScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        // 이미 지도 인스턴스가 있으면 제거
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.destroy(); } catch (e) { /* ignore */ }
          mapInstanceRef.current = null;
        }

        const center = new window.naver.maps.LatLng(lat || 37.5665, lng || 126.978);
        const map = new window.naver.maps.Map(mapRef.current, { center, zoom: 15 });
        mapInstanceRef.current = map;

        // 단일 마커 (상세 페이지용)
        if (lat && lng && name) {
          const marker = new window.naver.maps.Marker({ position: center, map });
          const infoWindow = new window.naver.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:13px;font-weight:600;">${name}</div>`,
          });
          window.naver.maps.Event.addListener(marker, 'click', () => infoWindow.open(map, marker));
        }

        // 복수 마커 (목록 지도용)
        markers.forEach((r) => {
          if (!r.latitude || !r.longitude) return;
          const position = new window.naver.maps.LatLng(r.latitude, r.longitude);
          const marker = new window.naver.maps.Marker({ position, map });
          const infoWindow = new window.naver.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:13px;font-weight:600;cursor:pointer;">${r.name}</div>`,
          });
          window.naver.maps.Event.addListener(marker, 'click', () => {
            infoWindow.open(map, marker);
            onMarkerClick && onMarkerClick(r);
          });
        });
      })
      .catch((err) => {
        console.error('[NaverMap] 지도 초기화 실패:', err.message);
      });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.destroy(); } catch (e) { /* Naver Maps SDK destroy()는 unmount 시 예외를 던질 수 있음 */ }
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name, markers, onMarkerClick]);

  if (!CLIENT_ID) {
    return (
      <div style={{ width: '100%', height, borderRadius: 'var(--radius-md)', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px' }}>
        지도 API 키가 설정되지 않았습니다
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height, borderRadius: 'var(--radius-md)' }} />;
}

export default NaverMap;
