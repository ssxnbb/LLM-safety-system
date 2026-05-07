export const organizationCatalog = [
  {
    domain: '航空',
    organizationName: '中国航空系统工程所（智航院）',
    modelName: '航空行业大模型',
    capability: '战术问答、态势感知',
    parameterScale: '32B',
  },
  {
    domain: '航空',
    organizationName: '中航工业直升机设计研究所',
    modelName: '直升机维修保障大模型',
    capability: '维修保障、故障诊断',
    parameterScale: '15B',
  },
  {
    domain: '航空',
    organizationName: '金航数码',
    modelName: '金航铁豹大模型',
    capability: '装备管理',
    parameterScale: '60B',
  },
  {
    domain: '航空',
    organizationName: '航空工业计算所',
    modelName: '智能数字员工大模型',
    capability: '电路智能审查、设计辅助',
    parameterScale: '80B',
  },
  {
    domain: '航天',
    organizationName: '航天科技集团体系院',
    modelName: '“天玄·千河”多模态模型',
    capability: '遥感检测、图文理解',
    parameterScale: '38B',
  },
  {
    domain: '航天',
    organizationName: '西安中科天塔科技',
    modelName: '华山大模型',
    capability: '轨道计算',
    parameterScale: '10B',
  },
  {
    domain: '航天',
    organizationName: '航天科工、之江实验室',
    modelName: '悟空AI大模型',
    capability: '航天作业助手',
    parameterScale: '20B',
  },
  {
    domain: '船舶',
    organizationName: '中船集团七〇九所',
    modelName: '深思大模型',
    capability: '态势理解、智能感知',
    parameterScale: '20B',
  },
  {
    domain: '船舶',
    organizationName: '中国船舶集团七一四所',
    modelName: '海鲲大模型',
    capability: '智能决策',
    parameterScale: '12B',
  },
  {
    domain: '船舶',
    organizationName: '中船智海院',
    modelName: '智海图灵大模型',
    capability: '信息融合、决策规划',
    parameterScale: '35B',
  },
  {
    domain: '船舶',
    organizationName: '中国船舶集团经济研究中心',
    modelName: '百舸船舶大模型',
    capability: '船舶设计与制造',
    parameterScale: '140B',
  },
  {
    domain: '兵器',
    organizationName: '兵器工业集团207所',
    modelName: '北极星大模型',
    capability: '作战指挥',
    parameterScale: '15B',
  },
  {
    domain: '兵器',
    organizationName: '智元研究院',
    modelName: '黄河大模型',
    capability: '目标识别、场景分析',
    parameterScale: '135B',
  },
  {
    domain: '电子',
    organizationName: '中电太极',
    modelName: '小可大模型',
    capability: '场景理解',
    parameterScale: '30B',
  },
  {
    domain: '电子',
    organizationName: '海康威视',
    modelName: '观澜大模型',
    capability: '能源控制',
    parameterScale: '20B',
  },
  {
    domain: '核',
    organizationName: '中核8所',
    modelName: '龙吟·万界大模型',
    capability: '生产管理',
    parameterScale: '670B',
  },
  {
    domain: '核',
    organizationName: '中核武汉',
    modelName: '核睿思语大模型',
    capability: '故障诊断、工艺问答',
    parameterScale: '300B',
  },
  {
    domain: '核',
    organizationName: '中核集团、华为',
    modelName: '华知大模型2.0',
    capability: '生产管理',
    parameterScale: '80B',
  },
  {
    domain: '核',
    organizationName: '中国广核集团与箴理科技',
    modelName: '锦书大模型',
    capability: '核知识管理',
    parameterScale: '100B',
  },
  {
    domain: '核',
    organizationName: '上海核工程研究设计院',
    modelName: '智汇星大模型',
    capability: '核电设计',
    parameterScale: '60B',
  },
]

export function getOrganizationsByDomain(domain) {
  return organizationCatalog.filter((item) => item.domain === domain)
}

export function getOrganizationByName(organizationName) {
  return organizationCatalog.find((item) => item.organizationName === organizationName) || null
}
