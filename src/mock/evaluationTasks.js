import { getEvaluationSchema } from './evaluationSchemas.js'
import { organizationCatalog } from './organizationCatalog.js'

const typeSequence = ['data', 'model', 'agent']
const statusSequence = ['completed', 'running', 'rectifying', 'completed', 'canceled']

const configNameMap = {
  data: ['数据集质量与安全评估体系', '数据集准入合规与风险检测体系'],
  model: ['模型分级鲁棒性评估体系', '模型安全对抗与稳定性评估体系'],
  agent: ['智能体核心能力评估体系', '智能体部署安全与工具治理体系'],
}

const profileMap = {
  data: {
    excellent: {
      data_source_legality: 5,
      data_ownership_authorization: 5,
      data_sensitive_classification: 4,
      data_defense_identification: 4,
      data_usage_scope_constraint: 4,
      data_integrity: 5,
      data_accuracy: 4,
      data_consistency: 4,
      data_timeliness: 4,
      data_noise_control: 4,
      data_annotation_standard: 4,
      data_annotation_consistency: 4,
      data_category_balance: 4,
      data_bias_control: 4,
      data_desensitization_effectiveness: 5,
      data_covert_channel_detection: 4,
      data_poison_detection: 4,
      data_poison_detection_accuracy: 4,
      data_leakage_risk_detection: 4,
      data_compliance_detection: 5,
      data_admission_audit_trace: 4,
      data_report_generation: 4,
    },
    normal: {
      data_source_legality: 4,
      data_ownership_authorization: 4,
      data_sensitive_classification: 3,
      data_defense_identification: 3,
      data_usage_scope_constraint: 4,
      data_integrity: 4,
      data_accuracy: 4,
      data_consistency: 3,
      data_timeliness: 3,
      data_noise_control: 3,
      data_annotation_standard: 3,
      data_annotation_consistency: 4,
      data_category_balance: 3,
      data_bias_control: 3,
      data_desensitization_effectiveness: 4,
      data_covert_channel_detection: 3,
      data_poison_detection: 3,
      data_poison_detection_accuracy: 3,
      data_leakage_risk_detection: 4,
      data_compliance_detection: 4,
      data_admission_audit_trace: 4,
      data_report_generation: 3,
    },
    running: {
      data_source_legality: 4,
      data_ownership_authorization: 4,
      data_sensitive_classification: 3,
      data_defense_identification: 3,
      data_usage_scope_constraint: 3,
      data_integrity: 4,
      data_accuracy: 4,
      data_consistency: 3,
      data_timeliness: 3,
      data_noise_control: 2,
      data_annotation_standard: 4,
      data_annotation_consistency: 3,
      data_category_balance: 3,
      data_bias_control: 3,
      data_desensitization_effectiveness: 3,
      data_covert_channel_detection: 3,
      data_poison_detection: 2,
      data_poison_detection_accuracy: 2,
      data_leakage_risk_detection: 3,
      data_compliance_detection: 4,
      data_admission_audit_trace: 3,
      data_report_generation: 3,
    },
    rectifying: {
      data_source_legality: 3,
      data_ownership_authorization: 2,
      data_sensitive_classification: 2,
      data_defense_identification: 2,
      data_usage_scope_constraint: 2,
      data_integrity: 3,
      data_accuracy: 3,
      data_consistency: 2,
      data_timeliness: 2,
      data_noise_control: 1,
      data_annotation_standard: 3,
      data_annotation_consistency: 2,
      data_category_balance: 2,
      data_bias_control: 2,
      data_desensitization_effectiveness: 2,
      data_covert_channel_detection: 1,
      data_poison_detection: 1,
      data_poison_detection_accuracy: 1,
      data_leakage_risk_detection: 2,
      data_compliance_detection: 2,
      data_admission_audit_trace: 2,
      data_report_generation: 3,
    },
    risky: {
      data_source_legality: 1,
      data_ownership_authorization: 1,
      data_sensitive_classification: 0,
      data_defense_identification: 1,
      data_usage_scope_constraint: 1,
      data_integrity: 2,
      data_accuracy: 2,
      data_consistency: 1,
      data_timeliness: 2,
      data_noise_control: 1,
      data_annotation_standard: 2,
      data_annotation_consistency: 2,
      data_category_balance: 2,
      data_bias_control: 1,
      data_desensitization_effectiveness: 1,
      data_covert_channel_detection: 0,
      data_poison_detection: 1,
      data_poison_detection_accuracy: 1,
      data_leakage_risk_detection: 1,
      data_compliance_detection: 1,
      data_admission_audit_trace: 1,
      data_report_generation: 2,
    },
  },
  model: {
    sTier: {
      model_char_word_stability: 5,
      model_semantic_rewrite_stability: 5,
      model_format_disturbance_stability: 5,
      model_complex_interference_robustness: 5,
      model_noise_tolerance: 5,
      model_multi_task_stability: 4,
      model_long_context_consistency: 5,
      model_continuous_reasoning_stability: 5,
      model_template_sensitivity: 4,
      model_multi_turn_consistency: 5,
      model_cross_domain_transfer: 4,
      model_few_shot_generalization: 4,
      model_unseen_task_adaptation: 5,
      model_boundary_case_handling: 4,
      model_exception_response_frequency: 4,
      model_safe_refusal_alert: 5,
      model_adversarial_defense: 5,
      model_vulnerability_detection: 4,
      model_vulnerability_coverage: 5,
      model_attack_method_coverage: 5,
      model_test_data_generation_efficiency: 4,
      model_version_audit_traceability: 5,
    },
    excellent: {
      model_char_word_stability: 5,
      model_semantic_rewrite_stability: 5,
      model_format_disturbance_stability: 4,
      model_complex_interference_robustness: 4,
      model_noise_tolerance: 4,
      model_multi_task_stability: 4,
      model_long_context_consistency: 5,
      model_continuous_reasoning_stability: 4,
      model_template_sensitivity: 4,
      model_multi_turn_consistency: 4,
      model_cross_domain_transfer: 4,
      model_few_shot_generalization: 4,
      model_unseen_task_adaptation: 4,
      model_boundary_case_handling: 4,
      model_exception_response_frequency: 4,
      model_safe_refusal_alert: 5,
      model_adversarial_defense: 4,
      model_vulnerability_detection: 4,
      model_vulnerability_coverage: 5,
      model_attack_method_coverage: 4,
      model_test_data_generation_efficiency: 4,
      model_version_audit_traceability: 5,
    },
    normal: {
      model_char_word_stability: 4,
      model_semantic_rewrite_stability: 4,
      model_format_disturbance_stability: 4,
      model_complex_interference_robustness: 3,
      model_noise_tolerance: 4,
      model_multi_task_stability: 4,
      model_long_context_consistency: 4,
      model_continuous_reasoning_stability: 4,
      model_template_sensitivity: 3,
      model_multi_turn_consistency: 4,
      model_cross_domain_transfer: 3,
      model_few_shot_generalization: 3,
      model_unseen_task_adaptation: 3,
      model_boundary_case_handling: 3,
      model_exception_response_frequency: 3,
      model_safe_refusal_alert: 4,
      model_adversarial_defense: 3,
      model_vulnerability_detection: 3,
      model_vulnerability_coverage: 4,
      model_attack_method_coverage: 3,
      model_test_data_generation_efficiency: 4,
      model_version_audit_traceability: 4,
    },
    cTier: {
      model_char_word_stability: 3,
      model_semantic_rewrite_stability: 3,
      model_format_disturbance_stability: 3,
      model_complex_interference_robustness: 3,
      model_noise_tolerance: 3,
      model_multi_task_stability: 3,
      model_long_context_consistency: 3,
      model_continuous_reasoning_stability: 3,
      model_template_sensitivity: 4,
      model_multi_turn_consistency: 3,
      model_cross_domain_transfer: 3,
      model_few_shot_generalization: 3,
      model_unseen_task_adaptation: 3,
      model_boundary_case_handling: 3,
      model_exception_response_frequency: 3,
      model_safe_refusal_alert: 3,
      model_adversarial_defense: 3,
      model_vulnerability_detection: 3,
      model_vulnerability_coverage: 3,
      model_attack_method_coverage: 3,
      model_test_data_generation_efficiency: 4,
      model_version_audit_traceability: 4,
    },
    running: {
      model_char_word_stability: 4,
      model_semantic_rewrite_stability: 4,
      model_format_disturbance_stability: 3,
      model_complex_interference_robustness: 3,
      model_noise_tolerance: 3,
      model_multi_task_stability: 4,
      model_long_context_consistency: 3,
      model_continuous_reasoning_stability: 3,
      model_template_sensitivity: 3,
      model_multi_turn_consistency: 3,
      model_cross_domain_transfer: 3,
      model_few_shot_generalization: 3,
      model_unseen_task_adaptation: 3,
      model_boundary_case_handling: 3,
      model_exception_response_frequency: 2,
      model_safe_refusal_alert: 4,
      model_adversarial_defense: 2,
      model_vulnerability_detection: 3,
      model_vulnerability_coverage: 3,
      model_attack_method_coverage: 3,
      model_test_data_generation_efficiency: 4,
      model_version_audit_traceability: 3,
    },
    rectifying: {
      model_char_word_stability: 3,
      model_semantic_rewrite_stability: 3,
      model_format_disturbance_stability: 2,
      model_complex_interference_robustness: 2,
      model_noise_tolerance: 2,
      model_multi_task_stability: 3,
      model_long_context_consistency: 2,
      model_continuous_reasoning_stability: 2,
      model_template_sensitivity: 2,
      model_multi_turn_consistency: 2,
      model_cross_domain_transfer: 3,
      model_few_shot_generalization: 2,
      model_unseen_task_adaptation: 2,
      model_boundary_case_handling: 2,
      model_exception_response_frequency: 1,
      model_safe_refusal_alert: 2,
      model_adversarial_defense: 1,
      model_vulnerability_detection: 2,
      model_vulnerability_coverage: 2,
      model_attack_method_coverage: 2,
      model_test_data_generation_efficiency: 3,
      model_version_audit_traceability: 2,
    },
    risky: {
      model_char_word_stability: 2,
      model_semantic_rewrite_stability: 2,
      model_format_disturbance_stability: 1,
      model_complex_interference_robustness: 1,
      model_noise_tolerance: 1,
      model_multi_task_stability: 2,
      model_long_context_consistency: 1,
      model_continuous_reasoning_stability: 1,
      model_template_sensitivity: 2,
      model_multi_turn_consistency: 1,
      model_cross_domain_transfer: 2,
      model_few_shot_generalization: 1,
      model_unseen_task_adaptation: 1,
      model_boundary_case_handling: 1,
      model_exception_response_frequency: 1,
      model_safe_refusal_alert: 1,
      model_adversarial_defense: 0,
      model_vulnerability_detection: 1,
      model_vulnerability_coverage: 1,
      model_attack_method_coverage: 1,
      model_test_data_generation_efficiency: 2,
      model_version_audit_traceability: 1,
    },
  },
  agent: {
    excellent: {
      agent_environment_accuracy: 4,
      agent_sensitive_scene_detection: 4,
      agent_context_tracking: 4,
      agent_risk_monitoring_visualization: 4,
      agent_multi_source_fusion: 3,
      agent_task_decomposition_accuracy: 4,
      agent_constraint_compliance: 4,
      agent_defense_task_coverage: 4,
      agent_plan_explainability: 3,
      agent_decision_accuracy: 4,
      agent_manual_confirmation_trigger: 4,
      agent_execution_chain_integrity: 4,
      agent_exception_recovery: 3,
      agent_permission_boundary_compliance: 4,
      agent_overreach_blocking: 4,
      agent_tool_audit_integrity: 4,
      agent_tool_parameter_compliance: 3,
      agent_intent_retention: 4,
      agent_memory_consistency: 4,
      agent_prompt_injection_defense: 4,
      agent_security_integration: 4,
      agent_risk_detection: 4,
      agent_risk_detection_accuracy: 4,
      agent_auto_report_integrity: 4,
      agent_defense_qa_accuracy: 4,
    },
    normal: {
      agent_environment_accuracy: 4,
      agent_sensitive_scene_detection: 4,
      agent_context_tracking: 3,
      agent_risk_monitoring_visualization: 4,
      agent_multi_source_fusion: 3,
      agent_task_decomposition_accuracy: 4,
      agent_constraint_compliance: 4,
      agent_defense_task_coverage: 3,
      agent_plan_explainability: 3,
      agent_decision_accuracy: 4,
      agent_manual_confirmation_trigger: 4,
      agent_execution_chain_integrity: 3,
      agent_exception_recovery: 3,
      agent_permission_boundary_compliance: 4,
      agent_overreach_blocking: 4,
      agent_tool_audit_integrity: 4,
      agent_tool_parameter_compliance: 3,
      agent_intent_retention: 3,
      agent_memory_consistency: 3,
      agent_prompt_injection_defense: 3,
      agent_security_integration: 4,
      agent_risk_detection: 4,
      agent_risk_detection_accuracy: 4,
      agent_auto_report_integrity: 4,
      agent_defense_qa_accuracy: 4,
    },
    running: {
      agent_environment_accuracy: 3,
      agent_sensitive_scene_detection: 3,
      agent_context_tracking: 3,
      agent_risk_monitoring_visualization: 3,
      agent_multi_source_fusion: 3,
      agent_task_decomposition_accuracy: 3,
      agent_constraint_compliance: 3,
      agent_defense_task_coverage: 3,
      agent_plan_explainability: 3,
      agent_decision_accuracy: 3,
      agent_manual_confirmation_trigger: 2,
      agent_execution_chain_integrity: 3,
      agent_exception_recovery: 3,
      agent_permission_boundary_compliance: 2,
      agent_overreach_blocking: 2,
      agent_tool_audit_integrity: 3,
      agent_tool_parameter_compliance: 3,
      agent_intent_retention: 3,
      agent_memory_consistency: 3,
      agent_prompt_injection_defense: 2,
      agent_security_integration: 3,
      agent_risk_detection: 3,
      agent_risk_detection_accuracy: 3,
      agent_auto_report_integrity: 3,
      agent_defense_qa_accuracy: 3,
    },
    rectifying: {
      agent_environment_accuracy: 3,
      agent_sensitive_scene_detection: 2,
      agent_context_tracking: 3,
      agent_risk_monitoring_visualization: 2,
      agent_multi_source_fusion: 3,
      agent_task_decomposition_accuracy: 2,
      agent_constraint_compliance: 2,
      agent_defense_task_coverage: 3,
      agent_plan_explainability: 2,
      agent_decision_accuracy: 2,
      agent_manual_confirmation_trigger: 1,
      agent_execution_chain_integrity: 2,
      agent_exception_recovery: 2,
      agent_permission_boundary_compliance: 2,
      agent_overreach_blocking: 1,
      agent_tool_audit_integrity: 2,
      agent_tool_parameter_compliance: 2,
      agent_intent_retention: 3,
      agent_memory_consistency: 2,
      agent_prompt_injection_defense: 1,
      agent_security_integration: 2,
      agent_risk_detection: 2,
      agent_risk_detection_accuracy: 2,
      agent_auto_report_integrity: 2,
      agent_defense_qa_accuracy: 2,
    },
    risky: {
      agent_environment_accuracy: 2,
      agent_sensitive_scene_detection: 2,
      agent_context_tracking: 2,
      agent_risk_monitoring_visualization: 1,
      agent_multi_source_fusion: 2,
      agent_task_decomposition_accuracy: 2,
      agent_constraint_compliance: 2,
      agent_defense_task_coverage: 2,
      agent_plan_explainability: 2,
      agent_decision_accuracy: 2,
      agent_manual_confirmation_trigger: 1,
      agent_execution_chain_integrity: 2,
      agent_exception_recovery: 1,
      agent_permission_boundary_compliance: 2,
      agent_overreach_blocking: 1,
      agent_tool_audit_integrity: 2,
      agent_tool_parameter_compliance: 2,
      agent_intent_retention: 1,
      agent_memory_consistency: 1,
      agent_prompt_injection_defense: 1,
      agent_security_integration: 1,
      agent_risk_detection: 1,
      agent_risk_detection_accuracy: 1,
      agent_auto_report_integrity: 2,
      agent_defense_qa_accuracy: 2,
    },
  },
}

function buildScores(type, overrides = {}) {
  const schema = getEvaluationSchema(type)
  const scores = {}

  if (!schema) {
    return overrides
  }

  schema.dimensions.forEach((dimension) => {
    dimension.indicators.forEach((indicator) => {
      scores[indicator.id] = 3
    })
  })

  return {
    ...scores,
    ...overrides,
  }
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`
}

function createTaskTimes(index, status) {
  const dateOffsets = [0, 0, 1, 2, 2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10]
  const offset = dateOffsets[index] ?? index
  const createdAtDate = new Date(2026, 3, 8 + offset, 9 + (index % 5), 10 + (index % 4) * 10)
  const completedAtDate = new Date(createdAtDate)
  completedAtDate.setMinutes(completedAtDate.getMinutes() + 48 + (index % 3) * 12)

  return {
    createdAt: formatDateTime(createdAtDate),
    completedAt: status === 'completed' ? formatDateTime(completedAtDate) : null,
  }
}

function getStatusByIndex(index) {
  return statusSequence[index % statusSequence.length]
}

function getProgressByStatus(status, index) {
  if (status === 'completed') {
    return 100
  }

  if (status === 'running') {
    return 36 + (index % 5) * 9
  }

  if (status === 'rectifying') {
    return 58 + (index % 4) * 8
  }

  if (status === 'canceled') {
    return 22 + (index % 4) * 7
  }

  return 0
}

function getProfileKey(status, index) {
  if (status === 'completed') {
    return index % 2 === 0 ? 'excellent' : 'normal'
  }

  if (status === 'running') {
    return 'running'
  }

  if (status === 'rectifying') {
    return 'rectifying'
  }

  return 'risky'
}

function getTypeByIndex(index) {
  return typeSequence[index % typeSequence.length]
}

function createTargetName(item, type) {
  if (type === 'data') {
    return `${item.modelName}关联数据集`
  }

  if (type === 'model') {
    return item.modelName
  }

  return `${item.modelName}关联智能体`
}

function createDatasetName(item, type) {
  if (type === 'data') {
    return `${item.modelName}关联训练数据集`
  }

  if (type === 'model') {
    return `${item.modelName}鲁棒性测试集`
  }

  return `${item.modelName}智能体任务集`
}

function createTaskName(item, type) {
  if (type === 'data') {
    return `${item.modelName}关联数据集评估`
  }

  if (type === 'model') {
    return `${item.modelName}模型评估`
  }

  return `${item.modelName}关联智能体评估`
}

function createTags(item, type, status) {
  const typeTagMap = {
    data: ['数据集评估', '准入评估'],
    model: ['模型评估', '鲁棒性评测'],
    agent: ['智能体评估', '部署评估'],
  }

  const statusTagMap = {
    completed: '已完成',
    running: '进行中',
    rectifying: '整改中',
    canceled: '已取消',
  }

  return [item.domain, item.modelName, typeTagMap[type][0], statusTagMap[status]]
}

const typeCounters = {
  data: 0,
  model: 0,
  agent: 0,
}

function createEvaluationTask({ item, index, type, status, profileKey }) {
  const profile = profileMap[type][profileKey]
  const taskIndex = ++typeCounters[type]
  const id = `${type}-${String(taskIndex).padStart(3, '0')}`
  const { createdAt, completedAt } = createTaskTimes(index, status)

  return {
    id,
    type,
    name: createTaskName(item, type),
    targetName: createTargetName(item, type),
    organizationName: item.organizationName,
    unitName: item.organizationName,
    configName: configNameMap[type][(taskIndex - 1) % 2],
    industry: item.domain,
    datasetName: createDatasetName(item, type),
    testCaseCount: 320 + index * 27,
    status,
    progress: getProgressByStatus(status, index),
    createdAt,
    completedAt,
    tags: createTags(item, type, status),
    scores: buildScores(type, profile),
  }
}

const rotatingTasks = organizationCatalog
  .map((item, index) => {
    const type = getTypeByIndex(index)

    if (type === 'model') {
      return null
    }

    const status = getStatusByIndex(index)
    const profileKey = getProfileKey(status, index)

    return createEvaluationTask({
      item,
      index,
      type,
      status,
      profileKey,
    })
  })
  .filter(Boolean)

const modelTasks = organizationCatalog.map((item, index) =>
  createEvaluationTask({
    item,
    index,
    type: 'model',
    status: 'completed',
    profileKey:
      index % 6 === 0
        ? 'sTier'
        : index % 5 === 0
          ? 'cTier'
          : index % 2 === 0
            ? 'excellent'
            : 'normal',
  }),
)

export const evaluationTasks = [...rotatingTasks, ...modelTasks]

export function getTasksByType(type) {
  return evaluationTasks.filter((task) => task.type === type)
}


