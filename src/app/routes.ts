import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import Dashboard from '@/pages/dashboard';
import Surveys from '@/pages/surveys';
import SurveyBuilder from '@/pages/survey-builder';
import SurveyDetail from '@/pages/survey-detail';
import Billing from '@/pages/billing';
import Help from '@/pages/help';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

export const router = createBrowserRouter([
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
]);
