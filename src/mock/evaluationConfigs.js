import { getEvaluationSchema } from './evaluationSchemas.js'

const STORAGE_KEY = 'llm-governance-evaluation-configs-v1'
let cachedRawValue = null
let cachedConfigs = null

export const securityModelOptions = ['Llama Guard', 'ShieldGemma', 'Lakera Guard']

const builtInConfigBlueprints = {
  data: [
    {
      id: 'data-default',
      name: '数据集质量与安全评估体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: false,
      securityModel: '',
    },
    {
      id: 'data-default-alt',
      name: '数据集准入合规与风险检测体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: true,
      securityModel: 'ShieldGemma',
      dimensions: [
        {
          id: 'data_source',
          weight: 24,
          indicators: [
            { id: 'data_source_legality', weight: 6 },
            { id: 'data_ownership_authorization', weight: 5 },
            { id: 'data_sensitive_classification', weight: 5 },
            { id: 'data_defense_identification', weight: 4 },
            { id: 'data_usage_scope_constraint', weight: 4 },
          ],
        },
        {
          id: 'data_quality',
          weight: 20,
          indicators: [
            { id: 'data_integrity', weight: 4 },
            { id: 'data_accuracy', weight: 5 },
            { id: 'data_consistency', weight: 4 },
            { id: 'data_timeliness', weight: 3 },
            { id: 'data_noise_control', weight: 4 },
          ],
        },
        {
          id: 'data_annotation_bias',
          weight: 14,
          indicators: [
            { id: 'data_annotation_standard', weight: 4 },
            { id: 'data_annotation_consistency', weight: 4 },
            { id: 'data_category_balance', weight: 3 },
            { id: 'data_bias_control', weight: 3 },
          ],
        },
        {
          id: 'data_security_risk',
          weight: 28,
          indicators: [
            { id: 'data_desensitization_effectiveness', weight: 6 },
            { id: 'data_covert_channel_detection', weight: 6 },
            { id: 'data_poison_detection', weight: 6 },
            { id: 'data_poison_detection_accuracy', weight: 5 },
            { id: 'data_leakage_risk_detection', weight: 5 },
          ],
        },
        {
          id: 'data_admission_support',
          weight: 14,
          indicators: [
            { id: 'data_compliance_detection', weight: 5 },
            { id: 'data_admission_audit_trace', weight: 5 },
            { id: 'data_report_generation', weight: 4 },
          ],
        },
      ],
    },
  ],
  model: [
    {
      id: 'model-default',
      name: '模型分级鲁棒性评估体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: false,
      securityModel: '',
    },
    {
      id: 'model-default-alt',
      name: '模型安全对抗与稳定性评估体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: true,
      securityModel: 'Llama Guard',
      dimensions: [
        {
          id: 'model_local_robustness',
          weight: 24,
          indicators: [
            { id: 'model_char_word_stability', weight: 5 },
            { id: 'model_semantic_rewrite_stability', weight: 5 },
            { id: 'model_format_disturbance_stability', weight: 4 },
            { id: 'model_complex_interference_robustness', weight: 5 },
            { id: 'model_noise_tolerance', weight: 5 },
          ],
        },
        {
          id: 'model_global_robustness',
          weight: 24,
          indicators: [
            { id: 'model_multi_task_stability', weight: 5 },
            { id: 'model_long_context_consistency', weight: 6 },
            { id: 'model_continuous_reasoning_stability', weight: 6 },
            { id: 'model_template_sensitivity', weight: 3 },
            { id: 'model_multi_turn_consistency', weight: 4 },
          ],
        },
        {
          id: 'model_generalization_robustness',
          weight: 14,
          indicators: [
            { id: 'model_cross_domain_transfer', weight: 4 },
            { id: 'model_few_shot_generalization', weight: 3 },
            { id: 'model_unseen_task_adaptation', weight: 4 },
            { id: 'model_boundary_case_handling', weight: 3 },
          ],
        },
        {
          id: 'model_exception_safety',
          weight: 22,
          indicators: [
            { id: 'model_exception_response_frequency', weight: 6 },
            { id: 'model_safe_refusal_alert', weight: 5 },
            { id: 'model_adversarial_defense', weight: 6 },
            { id: 'model_vulnerability_detection', weight: 5 },
          ],
        },
        {
          id: 'model_evaluation_governance',
          weight: 16,
          indicators: [
            { id: 'model_vulnerability_coverage', weight: 4 },
            { id: 'model_attack_method_coverage', weight: 4 },
            { id: 'model_test_data_generation_efficiency', weight: 4 },
            { id: 'model_version_audit_traceability', weight: 4 },
          ],
        },
      ],
    },
  ],
  agent: [
    {
      id: 'agent-default',
      name: '智能体核心能力评估体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: false,
      securityModel: '',
    },
    {
      id: 'agent-default-alt',
      name: '智能体部署安全与工具治理体系',
      isDefault: true,
      createdAt: '系统内置',
      updatedAt: '系统内置',
      securityModelEnabled: true,
      securityModel: 'Lakera Guard',
      dimensions: [
        {
          id: 'agent_environment_awareness',
          weight: 18,
          indicators: [
            { id: 'agent_environment_accuracy', weight: 4 },
            { id: 'agent_sensitive_scene_detection', weight: 4 },
            { id: 'agent_context_tracking', weight: 4 },
            { id: 'agent_risk_monitoring_visualization', weight: 3 },
            { id: 'agent_multi_source_fusion', weight: 3 },
          ],
        },
        {
          id: 'agent_task_planning',
          weight: 18,
          indicators: [
            { id: 'agent_task_decomposition_accuracy', weight: 5 },
            { id: 'agent_constraint_compliance', weight: 5 },
            { id: 'agent_defense_task_coverage', weight: 4 },
            { id: 'agent_plan_explainability', weight: 4 },
          ],
        },
        {
          id: 'agent_execution_decision',
          weight: 16,
          indicators: [
            { id: 'agent_decision_accuracy', weight: 5 },
            { id: 'agent_manual_confirmation_trigger', weight: 4 },
            { id: 'agent_execution_chain_integrity', weight: 4 },
            { id: 'agent_exception_recovery', weight: 3 },
          ],
        },
        {
          id: 'agent_tool_safety',
          weight: 18,
          indicators: [
            { id: 'agent_permission_boundary_compliance', weight: 5 },
            { id: 'agent_overreach_blocking', weight: 5 },
            { id: 'agent_tool_audit_integrity', weight: 4 },
            { id: 'agent_tool_parameter_compliance', weight: 4 },
          ],
        },
        {
          id: 'agent_multi_turn_stability',
          weight: 10,
          indicators: [
            { id: 'agent_intent_retention', weight: 3 },
            { id: 'agent_memory_consistency', weight: 3 },
            { id: 'agent_prompt_injection_defense', weight: 4 },
          ],
        },
        {
          id: 'agent_security_boundary',
          weight: 20,
          indicators: [
            { id: 'agent_security_integration', weight: 4 },
            { id: 'agent_risk_detection', weight: 4 },
            { id: 'agent_risk_detection_accuracy', weight: 4 },
            { id: 'agent_auto_report_integrity', weight: 4 },
            { id: 'agent_defense_qa_accuracy', weight: 4 },
          ],
        },
      ],
    },
  ],
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function createTimestamp() {
  const date = new Date()

  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`
}

function toNonNegativeNumber(value, fallbackValue) {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : fallbackValue
}

export function createEvaluationConfigId(type) {
  return `${type}-config-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function buildDimensionConfig(dimension, rawDimension = {}) {
  const rawIndicators = Array.isArray(rawDimension.indicators) ? rawDimension.indicators : []
  const selected = rawDimension.selected ?? true

  return {
    id: dimension.id,
    name: dimension.name,
    description: dimension.description,
    selected,
    weight: toNonNegativeNumber(rawDimension.weight, dimension.weight),
    indicators: dimension.indicators.map((indicator) => {
      const rawIndicator = rawIndicators.find((item) => item.id === indicator.id) || {}

      return {
        id: indicator.id,
        name: indicator.name,
        critical: indicator.critical,
        selected: selected ? rawIndicator.selected ?? true : false,
        weight: toNonNegativeNumber(rawIndicator.weight, indicator.weight),
      }
    }),
  }
}

export function createEvaluationConfigFromSchema(type, overrides = {}) {
  const schema = getEvaluationSchema(type)

  if (!schema) {
    return null
  }

  const createdAt = overrides.createdAt || createTimestamp()
  const updatedAt = overrides.updatedAt || createdAt
  const rawDimensions = Array.isArray(overrides.dimensions) ? overrides.dimensions : []

  return {
    id: overrides.id || createEvaluationConfigId(type),
    type,
    name: overrides.name || schema.title,
    objectName: schema.objectName,
    scoreLabel: schema.scoreLabel,
    baseTitle: schema.title,
    securityModelEnabled: overrides.securityModelEnabled ?? false,
    securityModel: overrides.securityModel || '',
    isDefault: overrides.isDefault ?? false,
    createdAt,
    updatedAt,
    dimensions: schema.dimensions.map((dimension) => {
      const rawDimension = rawDimensions.find((item) => item.id === dimension.id) || {}
      return buildDimensionConfig(dimension, rawDimension)
    }),
  }
}

function getBuiltInConfigBlueprints(type) {
  return builtInConfigBlueprints[type] || []
}

export function getDefaultEvaluationConfigs() {
  return Object.keys(builtInConfigBlueprints).flatMap((type) =>
    getBuiltInConfigBlueprints(type)
      .map((blueprint) => createEvaluationConfigFromSchema(type, blueprint))
      .filter(Boolean),
  )
}

function readStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

function writeStorage(configs, emitChange = true) {
  if (typeof window === 'undefined') {
    return
  }

  const serializedValue = JSON.stringify(configs)

  cachedRawValue = serializedValue
  cachedConfigs = configs
  window.localStorage.setItem(STORAGE_KEY, serializedValue)

  if (emitChange) {
    window.dispatchEvent(new Event('evaluation-configs-changed'))
  }
}

function normalizeConfigs(storedConfigs) {
  const sanitizedConfigs = storedConfigs
    .map((config) => createEvaluationConfigFromSchema(config.type, config))
    .filter(Boolean)

  const mergedConfigs = [...sanitizedConfigs]

  Object.keys(builtInConfigBlueprints).forEach((type) => {
    getBuiltInConfigBlueprints(type).forEach((blueprint) => {
      if (!mergedConfigs.some((config) => config.id === blueprint.id)) {
        const builtInConfig = createEvaluationConfigFromSchema(type, blueprint)

        if (builtInConfig) {
          mergedConfigs.push(builtInConfig)
        }
      }
    })
  })

  return mergedConfigs
}

export function getAllEvaluationConfigs() {
  if (typeof window === 'undefined') {
    return getDefaultEvaluationConfigs()
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    const defaultConfigs = getDefaultEvaluationConfigs()
    writeStorage(defaultConfigs, false)
    return defaultConfigs
  }

  if (rawValue === cachedRawValue && cachedConfigs) {
    return cachedConfigs
  }

  const storedConfigs = readStorage()

  if (!Array.isArray(storedConfigs) || storedConfigs.length === 0) {
    const defaultConfigs = getDefaultEvaluationConfigs()
    writeStorage(defaultConfigs, false)
    return defaultConfigs
  }

  const mergedConfigs = normalizeConfigs(storedConfigs)
  const normalizedRawValue = JSON.stringify(mergedConfigs)

  if (normalizedRawValue !== rawValue) {
    writeStorage(mergedConfigs, false)
    return mergedConfigs
  }

  cachedRawValue = rawValue
  cachedConfigs = mergedConfigs
  return mergedConfigs
}

export function subscribeEvaluationConfigs(callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('evaluation-configs-changed', callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener('evaluation-configs-changed', callback)
    window.removeEventListener('storage', callback)
  }
}

export function getEvaluationConfigs(type) {
  const configs = getAllEvaluationConfigs()
  return type ? configs.filter((config) => config.type === type) : configs
}

export function getEvaluationConfigById(id) {
  return getAllEvaluationConfigs().find((config) => config.id === id) || null
}

export function upsertEvaluationConfig(config) {
  const savedConfig = createEvaluationConfigFromSchema(config.type, {
    ...config,
    name: config.name?.trim() || config.name,
    updatedAt: createTimestamp(),
    createdAt: config.createdAt || createTimestamp(),
  })

  if (!savedConfig) {
    return null
  }

  const currentConfigs = getAllEvaluationConfigs()
  const exists = currentConfigs.some((item) => item.id === savedConfig.id)
  const nextConfigs = exists
    ? currentConfigs.map((item) => (item.id === savedConfig.id ? savedConfig : item))
    : [savedConfig, ...currentConfigs]

  writeStorage(nextConfigs)
  return savedConfig
}

export function removeEvaluationConfig(id) {
  const nextConfigs = getAllEvaluationConfigs().filter((config) => config.id !== id)
  writeStorage(nextConfigs)
  return nextConfigs
}

export function getSelectedDimensions(config) {
  if (!config) {
    return []
  }

  return config.dimensions.filter((dimension) => dimension.selected)
}

export function getSelectedIndicators(dimension) {
  if (!dimension) {
    return []
  }

  return dimension.indicators.filter((indicator) => indicator.selected)
}

export function countSelectedDimensions(config) {
  return getSelectedDimensions(config).length
}

export function countSelectedIndicators(config) {
  return getSelectedDimensions(config).reduce(
    (total, dimension) => total + getSelectedIndicators(dimension).length,
    0,
  )
}

export function countSelectedCriticalIndicators(config) {
  return getSelectedDimensions(config).reduce(
    (total, dimension) =>
      total + getSelectedIndicators(dimension).filter((indicator) => indicator.critical).length,
    0,
  )
}

export function getSelectedDimensionWeightTotal(config) {
  return getSelectedDimensions(config).reduce(
    (total, dimension) => total + Number(dimension.weight || 0),
    0,
  )
}

export function getFirstSelectedDimensionId(config) {
  return getSelectedDimensions(config)[0]?.id || ''
}

