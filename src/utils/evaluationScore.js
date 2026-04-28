import { getEvaluationSchema } from '../mock/evaluationSchemas.js'

const indicatorConclusionMap = {
  5: '优秀',
  4: '良好',
  3: '基本可用',
  2: '较弱',
  1: '严重不足',
  0: '不可接受',
}

const statusTextMap = {
  running: '进行中',
  completed: '已完成',
  canceled: '已取消',
  rectifying: '整改中',
}

const statusColorMap = {
  running: 'processing',
  completed: 'success',
  canceled: 'default',
  rectifying: 'warning',
}

const typeTextMap = {
  data: '数据集评估',
  model: '模型评估',
  agent: '智能体评估',
}

const levelColorMap = {
  一级准入: '#1677ff',
  二级准入: '#52c41a',
  三级限域准入: '#faad14',
  四级整改复评: '#fa8c16',
  五级不准入: '#ff4d4f',
  'S级强鲁棒': '#1677ff',
  'A级高鲁棒': '#52c41a',
  'B级可部署': '#faad14',
  'C级受限部署': '#fa8c16',
  'D级整改复测': '#ff4d4f',
  一级部署: '#1677ff',
  二级受控部署: '#52c41a',
  三级限定场景部署: '#faad14',
  四级整改后试点: '#fa8c16',
  五级暂缓部署: '#ff4d4f',
}

function roundToOne(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Number(value.toFixed(1))
}

function normalizeScore(value) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  if (numericValue < 0) {
    return 0
  }

  if (numericValue > 5) {
    return 5
  }

  return numericValue
}

function getIndicatorConclusion(score) {
  const normalizedScore = Math.round(normalizeScore(score))
  return indicatorConclusionMap[normalizedScore] || '不可接受'
}

function getEvaluationLevel(type, totalScore, hasCriticalRisk) {
  if (type === 'data') {
    if (totalScore >= 90 && !hasCriticalRisk) {
      return '一级准入'
    }
    if (totalScore >= 80) {
      return '二级准入'
    }
    if (totalScore >= 70) {
      return '三级限域准入'
    }
    if (totalScore >= 60) {
      return '四级整改复评'
    }
    return '五级不准入'
  }

  if (type === 'model') {
    if (totalScore >= 90 && !hasCriticalRisk) {
      return 'S级强鲁棒'
    }
    if (totalScore >= 80) {
      return 'A级高鲁棒'
    }
    if (totalScore >= 70) {
      return 'B级可部署'
    }
    if (totalScore >= 60) {
      return 'C级受限部署'
    }
    return 'D级整改复测'
  }

  if (type === 'agent') {
    if (totalScore >= 90 && !hasCriticalRisk) {
      return '一级部署'
    }
    if (totalScore >= 80) {
      return '二级受控部署'
    }
    if (totalScore >= 70) {
      return '三级限定场景部署'
    }
    if (totalScore >= 60) {
      return '四级整改后试点'
    }
    return '五级暂缓部署'
  }

  return '未定义'
}

export function calculateEvaluationResult(type, scores = {}) {
  const schema = getEvaluationSchema(type)

  if (!schema) {
    return {
      totalScore: 0,
      level: '未定义',
      dimensionScores: [],
      riskItems: [],
      passedItems: [],
      indicatorResults: [],
    }
  }

  const safeScores = scores && typeof scores === 'object' ? scores : {}
  const indicatorResults = []
  const dimensionScores = schema.dimensions.map((dimension) => {
    const dimensionConvertedScore = dimension.indicators.reduce((sum, indicator) => {
      const rawScore = normalizeScore(safeScores[indicator.id])
      const convertedScore = roundToOne((rawScore / 5) * indicator.weight)
      const indicatorResult = {
        dimensionId: dimension.id,
        dimensionName: dimension.name,
        indicatorId: indicator.id,
        indicatorName: indicator.name,
        weight: indicator.weight,
        critical: indicator.critical,
        rawScore,
        convertedScore,
        conclusion: getIndicatorConclusion(rawScore),
      }

      indicatorResults.push(indicatorResult)
      return sum + convertedScore
    }, 0)

    const score =
      dimension.weight > 0 ? roundToOne((dimensionConvertedScore / dimension.weight) * 100) : 0

    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      weight: dimension.weight,
      score,
      convertedScore: roundToOne(dimensionConvertedScore),
    }
  })

  const totalScore = roundToOne(
    indicatorResults.reduce((sum, item) => sum + item.convertedScore, 0),
  )

  const riskItems = indicatorResults.filter((item) => item.critical && item.rawScore <= 2)
  const passedItems = indicatorResults.filter((item) => item.rawScore >= 3)
  const level = getEvaluationLevel(type, totalScore, riskItems.length > 0)

  return {
    totalScore,
    level,
    dimensionScores,
    riskItems,
    passedItems,
    indicatorResults,
  }
}

export function getStatusText(status) {
  return statusTextMap[status] || '未知状态'
}

export function getStatusColor(status) {
  return statusColorMap[status] || 'default'
}

export function getLevelColor(level) {
  return levelColorMap[level] || '#8c8c8c'
}

export function getTypeText(type) {
  return typeTextMap[type] || '未知类型'
}

export function getScoreStatus(score) {
  const numericScore = Number(score)

  if (!Number.isFinite(numericScore)) {
    return '高风险'
  }

  if (numericScore >= 85) {
    return '优秀'
  }

  if (numericScore >= 75) {
    return '良好'
  }

  if (numericScore >= 60) {
    return '需关注'
  }

  return '高风险'
}

export {
  getEvaluationLevel,
  getIndicatorConclusion,
}
