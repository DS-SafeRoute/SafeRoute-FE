import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layout/AppLayout';
import { ROUTES } from '@/shared/constants/path';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.LANDING,
        lazy: async () => {
          const { default: LandingPage } = await import('@/pages/landing/LandingPage');
          return { Component: LandingPage };
        },
      },
      {
        path: ROUTES.SIGNUP,
        lazy: async () => {
          const { default: SignupPage } = await import('@/pages/signup/SignupPage');
          return { Component: SignupPage };
        },
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => {
          const { default: LoginPage } = await import('@/pages/login/LoginPage');
          return { Component: LoginPage };
        },
      },
      {
        path: ROUTES.HOME,
        lazy: async () => {
          const { default: HomePage } = await import('@/pages/home/HomePage');
          return { Component: HomePage };
        },
      },
      {
        path: ROUTES.SCENARIO_SETTINGS,
        lazy: async () => {
          const { default: ScenarioSettingsPage } =
            await import('@/pages/scenarioSettings/ScenarioSettingsPage');
          return { Component: ScenarioSettingsPage };
        },
      },
      {
        path: ROUTES.MANAGEMENT,
        lazy: async () => {
          const { default: ManagementPage } = await import('@/pages/management/ManagementPage');
          return { Component: ManagementPage };
        },
      },
      {
        path: ROUTES.BUILDINGS,
        lazy: async () => {
          const { default: BuildingsPage } = await import('@/pages/buildings/BuildingsPage');
          return { Component: BuildingsPage };
        },
      },
      {
        path: ROUTES.FLOOR_PLANS,
        lazy: async () => {
          const { default: FloorPlansPage } = await import('@/pages/floorPlans/FloorPlansPage');
          return { Component: FloorPlansPage };
        },
      },
      {
        path: ROUTES.FLOOR_PLANS_DETAIL,
        lazy: async () => {
          const { default: FloorPlansDetailPage } =
            await import('@/pages/floorPlans/FloorPlansDetailPage');
          return { Component: FloorPlansDetailPage };
        },
      },
      {
        path: ROUTES.CAMERAS,
        lazy: async () => {
          const { default: CamerasPage } = await import('@/pages/cameras/CamerasPage');
          return { Component: CamerasPage };
        },
      },
      {
        path: ROUTES.TRAINING_ANALYSIS,
        lazy: async () => {
          const { default: TrainingAnalysisPage } =
            await import('@/pages/trainingAnalysis/TrainingAnalysisPage');
          return { Component: TrainingAnalysisPage };
        },
      },
      {
        path: ROUTES.REPORTS,
        lazy: async () => {
          const { default: ReportsPage } = await import('@/pages/reports/ReportsPage');
          return { Component: ReportsPage };
        },
      },
    ],
  },
]);

export default router;
