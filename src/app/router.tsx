import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { AppLayout } from './AppLayout';
import { RouteError } from './RouteError';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: () => import('../routes/TodayPickRoute') },
      { path: 'picks', lazy: () => import('../routes/PastPicksRoute') },
      { path: 'picks/:pickId', lazy: () => import('../routes/PickDetailRoute') },
      { path: 'history', lazy: () => import('../routes/VoteHistoryRoute') },
      { path: 'profile', lazy: () => import('../routes/ProfileRoute') },
      { path: 'profile/edit', lazy: () => import('../routes/ProfileEditRoute') },
    ],
  },
];

export const router = createBrowserRouter(routes);
