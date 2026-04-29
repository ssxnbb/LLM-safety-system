export const topNavItems = [{ key: 'risk', label: '大模型风险评测' }]

export const overallOverviewRoute = {
  key: 'overall-overview',
  label: '总体评估概览',
  path: '/evaluation/overview',
  title: '总体评估概览',
}

export const evaluationSections = [
  {
    key: 'data',
    label: '数据集评估',
    children: [
      { key: 'overview', label: '评估概览', path: '/evaluation/data/overview', title: '评估概览' },
      { key: 'create', label: '新建评估', path: '/evaluation/data/create', title: '新建评估' },
      { key: 'config', label: '评估配置', path: '/evaluation/data/config', title: '评估配置' },
      { key: 'tasks', label: '评估任务', path: '/evaluation/data/tasks', title: '评估任务' },
      { key: 'report', label: '报告详情', path: '/evaluation/data/report/:id', title: '报告详情', hideInMenu: true },
    ],
  },
  {
    key: 'model',
    label: '模型评估',
    children: [
      { key: 'overview', label: '评估概览', path: '/evaluation/model/overview', title: '评估概览' },
      { key: 'create', label: '新建评估', path: '/evaluation/model/create', title: '新建评估' },
      { key: 'config', label: '评估配置', path: '/evaluation/model/config', title: '评估配置' },
      { key: 'tasks', label: '评估任务', path: '/evaluation/model/tasks', title: '评估任务' },
      { key: 'report', label: '报告详情', path: '/evaluation/model/report/:id', title: '报告详情', hideInMenu: true },
    ],
  },
  {
    key: 'agent',
    label: '智能体评估',
    children: [
      { key: 'overview', label: '评估概览', path: '/evaluation/agent/overview', title: '评估概览' },
      { key: 'create', label: '新建评估', path: '/evaluation/agent/create', title: '新建评估' },
      { key: 'config', label: '评估配置', path: '/evaluation/agent/config', title: '评估配置' },
      { key: 'tasks', label: '评估任务', path: '/evaluation/agent/tasks', title: '评估任务' },
      { key: 'report', label: '报告详情', path: '/evaluation/agent/report/:id', title: '报告详情', hideInMenu: true },
    ],
  },
]

function routePatternToRegex(path) {
  const pattern = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        return '[^/]+'
      }

      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  return new RegExp(`^${pattern}$`)
}

export function getSidebarItems() {
  return [
    {
      key: overallOverviewRoute.path,
      label: overallOverviewRoute.label,
    },
    ...evaluationSections.map((section) => ({
      key: section.key,
      label: section.label,
      children: section.children
        .filter((item) => !item.hideInMenu)
        .map((item) => ({
          key: item.path,
          label: item.label,
        })),
    })),
  ]
}

export function findRouteMeta(pathname) {
  if (routePatternToRegex(overallOverviewRoute.path).test(pathname)) {
    return {
      section: null,
      route: overallOverviewRoute,
    }
  }

  for (const section of evaluationSections) {
    for (const route of section.children) {
      if (routePatternToRegex(route.path).test(pathname)) {
        return {
          section,
          route,
        }
      }
    }
  }

  return null
}

export function getSelectedMenuKey(pathname) {
  const matched = findRouteMeta(pathname)

  if (!matched) {
    return []
  }

  if (!matched.section) {
    return [matched.route.path]
  }

  if (matched.route.hideInMenu) {
    const fallbackRoute = matched.section.children.find((item) => item.key === 'tasks')
    return fallbackRoute ? [fallbackRoute.path] : []
  }

  return [matched.route.path]
}

export function getOpenMenuKeys(pathname) {
  const matched = findRouteMeta(pathname)
  return matched?.section ? [matched.section.key] : []
}
