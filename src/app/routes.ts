import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import RequireAuth from './RequireAuth';
import Dashboard from '@/pages/dashboard';
import Surveys from '@/pages/surveys';
import SurveyBuilder from '@/pages/survey-builder';
import SurveyDetail from '@/pages/survey-detail';
import Billing from '@/pages/billing';
import Help from '@/pages/help';
import Settings from '@/pages/settings';
import Login from '@/pages/login';
import ForgotPassword from '@/pages/forgot-password';
import NotFound from '@/pages/not-found';

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/forgot-password', Component: ForgotPassword },
  {
    Component: RequireAuth,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'dashboard', Component: Dashboard },
          { path: 'surveys', Component: Surveys },
          { path: 'surveys/new', Component: SurveyBuilder },
          { path: 'surveys/:id', Component: SurveyDetail },
          { path: 'billing', Component: Billing },
          { path: 'help', Component: Help },
          { path: 'settings', Component: Settings },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
