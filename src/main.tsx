import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import App from '@/App';

// async function enableMocking() {
//   if (!import.meta.env.DEV) return;

//   const { worker } = await import('@/shared/mocks/browser');
//   return worker.start({ onUnhandledRequest: 'bypass' });
// }

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

// enableMocking()이 reject되면(Service Worker 등록 차단 등 — 개발 환경/브라우저 정책에 따라
// 얼마든지 날 수 있음) .then만으로는 영원히 흰 화면이 됨. 실 API를 쓰는 요청은 MSW가
// onUnhandledRequest: 'bypass'로 어차피 그냥 통과시키므로, 등록 실패해도 렌더링은 계속함
enableMocking()
  .catch((error: unknown) => {
    console.error('[MSW] mocking 활성화 실패 — mock 없이 계속 진행합니다', error);
  })
  .finally(renderApp);
