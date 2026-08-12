import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router';

import router from '@routes/router';

import { queryClient } from '@apis/config/queryClient';

import { ToastProvider } from '@components/toast/ToastProvider';
import '@styles/global.css';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
