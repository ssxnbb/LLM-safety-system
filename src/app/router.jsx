import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { evaluationSections, overallOverviewRoute } from './evaluationConfig.js'
import MainLayout from '../layouts/MainLayout.jsx'
import EvaluationConfig from '../pages/evaluation/EvaluationConfig.jsx'
import EvaluationCreate from '../pages/evaluation/EvaluationCreate.jsx'
import EvaluationOverview from '../pages/evaluation/EvaluationOverview.jsx'
import EvaluationReport from '../pages/evaluation/EvaluationReport.jsx'
import EvaluationTasks from '../pages/evaluation/EvaluationTasks.jsx'
import OverallEvaluationOverview from '../pages/evaluation/OverallEvaluationOverview.jsx'
import EvaluationPage from '../pages/evaluation/EvaluationPage.jsx'

const evaluationRoutes = evaluationSections.flatMap((section) =>
  section.children.map((route) => ({
    path: route.path.slice(1),
    element:
      route.key === 'overview' ? (
        <EvaluationOverview />
      ) : route.key === 'create' ? (
        <EvaluationCreate />
      ) : route.key === 'config' ? (
        <EvaluationConfig />
      ) : route.key === 'tasks' ? (
        <EvaluationTasks />
      ) : route.key === 'report' ? (
        <EvaluationReport />
      ) : (
        <EvaluationPage sectionLabel={section.label} title={route.title} />
      ),
  })),
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={overallOverviewRoute.path} replace />,
      },
      {
        path: overallOverviewRoute.path.slice(1),
        element: <OverallEvaluationOverview />,
      },
      ...evaluationRoutes,
      {
        path: '*',
        element: <Navigate to={overallOverviewRoute.path} replace />,
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
