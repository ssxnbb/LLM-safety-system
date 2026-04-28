import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { evaluationSections } from './evaluationConfig.js'
import MainLayout from '../layouts/MainLayout.jsx'
import EvaluationConfig from '../pages/evaluation/EvaluationConfig.jsx'
import EvaluationCreate from '../pages/evaluation/EvaluationCreate.jsx'
import EvaluationOverview from '../pages/evaluation/EvaluationOverview.jsx'
import EvaluationReport from '../pages/evaluation/EvaluationReport.jsx'
import EvaluationTasks from '../pages/evaluation/EvaluationTasks.jsx'
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
        element: <Navigate to="/evaluation/data/overview" replace />,
      },
      ...evaluationRoutes,
      {
        path: '*',
        element: <Navigate to="/evaluation/data/overview" replace />,
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
