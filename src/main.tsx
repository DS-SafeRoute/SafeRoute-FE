import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import App from '@/App';

async function enableMocking() {
  if (!import.meta.env.DEV) return;

  const { worker } = await import('@/shared/mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
