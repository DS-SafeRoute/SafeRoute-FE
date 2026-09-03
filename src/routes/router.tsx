import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layout/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ROUTES } from '@/shared/constants/path';

const loadScenarioSettingsPage = async () => {
  const { default: ScenarioSettingsPage } =
    await import('@/pages/scenarioSettings/ScenarioSettingsPage');
  return { Component: ScenarioSettingsPage };
};

const loadReportsPage = async () => {
  const { default: ReportsPage } = await import('@/pages/reports/ReportsPage');
  return { Component: ReportsPage };
};

const router = createBrowserRouter([
  {
    path: ROUTES.LANDING,
    lazy: async () => {
      const { default: LandingPage } = await import('@/pages/landing/LandingPage');
      return { Component: LandingPage };
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
    path: ROUTES.SIGNUP,
    lazy: async () => {
      const { default: SignupPage } = await import('@/pages/signup/SignupPage');
      return { Component: SignupPage };
    },
  },
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          const { default: HomePage } = await import('@/pages/home/HomePage');
          return { Component: HomePage };
        },
      },
      {
        path: ROUTES.SCENARIO_LIST,
        lazy: async () => {
          const { default: ScenarioListPage } =
            await import('@/pages/scenarioSettings/ScenarioListPage');
          return { Component: ScenarioListPage };
        },
      },
      {
        path: ROUTES.SCENARIO_CREATE,
        lazy: loadScenarioSettingsPage,
      },
      {
        path: ROUTES.SCENARIO_DETAIL,
        lazy: loadScenarioSettingsPage,
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
        path: ROUTES.TRAINING_ANALYSIS,
        lazy: async () => {
          const { default: TrainingAnalysisPage } =
            await import('@/pages/trainingAnalysis/TrainingAnalysisPage');
          return { Component: TrainingAnalysisPage };
        },
      },
      {
        path: ROUTES.TRAINING_CAMERAS,
        lazy: async () => {
          const { default: TrainingCamerasPage } =
            await import('@/pages/trainingAnalysis/TrainingCamerasPage');
          return { Component: TrainingCamerasPage };
        },
      },
      {
        path: ROUTES.TRAINING_CAMERA_FRAMES,
        lazy: async () => {
          const { default: TrainingCameraFramesPage } =
            await import('@/pages/trainingAnalysis/TrainingCameraFramesPage');
          return { Component: TrainingCameraFramesPage };
        },
      },
      {
        path: ROUTES.REPORTS,
        lazy: loadReportsPage,
      },
    ],
  },
]);

export default router;
