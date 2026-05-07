import { ReloadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Row, Table, message } from "antd";
import { Activity, BarChart3, Building2, CheckCircle2 } from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageTitle from "../../components/evaluation/PageTitle.jsx";
import RiskTag from "../../components/evaluation/RiskTag.jsx";
import StatCard from "../../components/evaluation/StatCard.jsx";
import { organizationCatalog } from "../../mock/organizationCatalog.js";
import { evaluationTasks } from "../../mock/evaluationTasks.js";
import {
  calculateEvaluationResult,
  getScoreStatus,
} from "../../utils/evaluationScore.js";
import "./OverallEvaluationOverview.css";

const typeMetaMap = {
  data: { label: "数据集评估", color: "#1677ff" },
  model: { label: "模型评估", color: "#52c41a" },
  agent: { label: "智能体评估", color: "#fa8c16" },
};

const statusTextMap = {
  running: "进行中",
  completed: "已完成",
  canceled: "已取消",
  rectifying: "整改中",
};

const statusTagTypeMap = {
  running: "processing",
  completed: "success",
  canceled: "default",
  rectifying: "warning",
};

const pieColors = ["#1677ff", "#52c41a", "#faad14", "#fa8c16", "#ff4d4f"];
const fullModuleCoverageText = "数据集评估、模型评估、智能体评估";
const monthlyTaskTrendData = [
  {
    month: "1月",
    aviation: 32,
    aerospace: 28,
    shipbuilding: 35,
    weapons: 24,
    electronics: 26,
    nuclear: 38,
  },
  {
    month: "2月",
    aviation: 38,
    aerospace: 33,
    shipbuilding: 42,
    weapons: 28,
    electronics: 31,
    nuclear: 45,
  },
  {
    month: "3月",
    aviation: 49,
    aerospace: 41,
    shipbuilding: 54,
    weapons: 37,
    electronics: 40,
    nuclear: 58,
  },
  {
    month: "4月",
    aviation: 46,
    aerospace: 39,
    shipbuilding: 50,
    weapons: 35,
    electronics: 38,
    nuclear: 54,
  },
  {
    month: "5月",
    aviation: 61,
    aerospace: 50,
    shipbuilding: 66,
    weapons: 47,
    electronics: 49,
    nuclear: 70,
  },
  {
    month: "6月",
    aviation: 67,
    aerospace: 56,
    shipbuilding: 72,
    weapons: 52,
    electronics: 55,
    nuclear: 76,
  },
  {
    month: "7月",
    aviation: 59,
    aerospace: 49,
    shipbuilding: 63,
    weapons: 44,
    electronics: 46,
    nuclear: 66,
  },
  {
    month: "8月",
    aviation: 71,
    aerospace: 60,
    shipbuilding: 75,
    weapons: 55,
    electronics: 58,
    nuclear: 80,
  },
  {
    month: "9月",
    aviation: 79,
    aerospace: 67,
    shipbuilding: 84,
    weapons: 62,
    electronics: 65,
    nuclear: 88,
  },
  {
    month: "10月",
    aviation: 75,
    aerospace: 64,
    shipbuilding: 80,
    weapons: 59,
    electronics: 62,
    nuclear: 84,
  },
  {
    month: "11月",
    aviation: 89,
    aerospace: 76,
    shipbuilding: 93,
    weapons: 70,
    electronics: 74,
    nuclear: 97,
  },
  {
    month: "12月",
    aviation: 86,
    aerospace: 79,
    shipbuilding: 90,
    weapons: 68,
    electronics: 78,
    nuclear: 100,
  },
];
const monthlyTypeDistributionData = [
  { month: "1月", data: 8, model: 12, agent: 6 },
  { month: "2月", data: 12, model: 16, agent: 9 },
  { month: "3月", data: 18, model: 22, agent: 14 },
  { month: "4月", data: 22, model: 28, agent: 18 },
  { month: "5月", data: 28, model: 35, agent: 24 },
  { month: "6月", data: 34, model: 42, agent: 30 },
  { month: "7月", data: 40, model: 50, agent: 37 },
  { month: "8月", data: 48, model: 58, agent: 44 },
  { month: "9月", data: 56, model: 67, agent: 52 },
  { month: "10月", data: 64, model: 75, agent: 60 },
  { month: "11月", data: 72, model: 84, agent: 69 },
  { month: "12月", data: 80, model: 92, agent: 78 },
];
const industryTrendMeta = [
  { key: "aviation", label: "航空", color: "#3b82f6" },
  { key: "aerospace", label: "航天", color: "#8b5cf6" },
  { key: "shipbuilding", label: "船舶", color: "#06b6d4" },
  { key: "weapons", label: "兵器", color: "#f59e0b" },
  { key: "electronics", label: "电子", color: "#22c55e" },
  { key: "nuclear", label: "核工业", color: "#ef4444" },
];

function roundToOne(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(1));
}

function buildOverallData() {
  const tasks = evaluationTasks
    .map((task) => {
      const result = calculateEvaluationResult(task.type, task.scores);

      return {
        ...task,
        result,
        isHighRisk: result.riskItems.length > 0 || result.totalScore < 60,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const averageScore = totalTasks
    ? roundToOne(
        tasks.reduce((sum, task) => sum + task.result.totalScore, 0) /
          totalTasks,
      )
    : 0;
  const participatingOrganizations = new Set(
    tasks.map((task) => task.organizationName),
  ).size;

  const typeDistribution = Object.entries(typeMetaMap).map(([type, meta]) => {
    const relatedTasks = tasks.filter((task) => task.type === type);
    const average = relatedTasks.length
      ? roundToOne(
          relatedTasks.reduce((sum, task) => sum + task.result.totalScore, 0) /
            relatedTasks.length,
        )
      : 0;

    return {
      type,
      name: meta.label,
      value: relatedTasks.length,
      averageScore: average,
      color: meta.color,
    };
  });

  const statusDistribution = Object.entries(statusTextMap).map(
    ([status, label]) => ({
      name: label,
      value: tasks.filter((task) => task.status === status).length,
    }),
  );

  const organizationTaskMap = tasks.reduce((accumulator, task) => {
    if (!accumulator[task.organizationName]) {
      accumulator[task.organizationName] = {
        taskCount: 0,
        completedCount: 0,
        highRiskCount: 0,
        modules: new Set(),
      };
    }

    const current = accumulator[task.organizationName];
    current.taskCount += 1;
    current.modules.add(typeMetaMap[task.type].label);

    if (task.status === "completed") {
      current.completedCount += 1;
    }

    if (task.isHighRisk) {
      current.highRiskCount += 1;
    }

    return accumulator;
  }, {});

  const organizationParticipation = organizationCatalog.map((item) => {
    const taskStats = organizationTaskMap[item.organizationName];

    return {
      key: item.organizationName,
      domain: item.domain,
      organizationName: item.organizationName,
      modelName: item.modelName,
      capability: item.capability,
      parameterScale: item.parameterScale,
      taskCount: taskStats?.taskCount || 0,
      completedCount: taskStats?.completedCount || 0,
      highRiskCount: 0,
      modulesText: fullModuleCoverageText,
    };
  });

  const recentTasks = tasks.slice(0, 8);

  return {
    totalTasks,
    completedTasks,
    averageScore,
    participatingOrganizations,
    typeDistribution,
    statusDistribution,
    organizationParticipation,
    recentTasks,
  };
}

function MonthlyTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const metaMap = industryTrendMeta.reduce((accumulator, item) => {
    accumulator[item.key] = item;
    return accumulator;
  }, {});

  const deduplicatedPayload = payload.reduce((accumulator, item) => {
    if (!metaMap[item.dataKey]) {
      return accumulator;
    }

    accumulator.set(item.dataKey, item);
    return accumulator;
  }, new Map());

  return (
    <div className="overall-overview-tooltip">
      <div className="overall-overview-tooltip__title">{label}</div>
      <div className="overall-overview-tooltip__list">
        {Array.from(deduplicatedPayload.values()).map((item) => {
          const meta = metaMap[item.dataKey];

          return (
            <div key={item.dataKey} className="overall-overview-tooltip__item">
              <span
                className="overall-overview-tooltip__dot"
                style={{ backgroundColor: meta.color }}
              />
              <span className="overall-overview-tooltip__label">
                {meta.label}
              </span>
              <span className="overall-overview-tooltip__value">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverallEvaluationOverview() {
  const overviewData = buildOverallData();

  const taskColumns = [
    {
      title: "模块",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (value) => (
        <RiskTag type="processing">
          {typeMetaMap[value]?.label || value}
        </RiskTag>
      ),
    },
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      width: 220,
    },
    {
      title: "所属单位",
      dataIndex: "organizationName",
      key: "organizationName",
      width: 220,
    },
    {
      title: "评估对象",
      dataIndex: "targetName",
      key: "targetName",
      width: 220,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (value) => (
        <RiskTag type={statusTagTypeMap[value]}>{statusTextMap[value]}</RiskTag>
      ),
    },
    {
      title: "总分",
      dataIndex: ["result", "totalScore"],
      key: "totalScore",
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
    },
  ];

  const organizationColumns = [
    {
      title: "领域",
      dataIndex: "domain",
      key: "domain",
      width: 100,
    },
    {
      title: "单位",
      dataIndex: "organizationName",
      key: "organizationName",
      width: 220,
    },
    {
      title: "关联模型",
      dataIndex: "modelName",
      key: "modelName",
      width: 180,
    },
    {
      title: "功能",
      dataIndex: "capability",
      key: "capability",
      width: 220,
    },
    {
      title: "参数",
      dataIndex: "parameterScale",
      key: "parameterScale",
      width: 90,
    },
    {
      title: "参与任务数",
      dataIndex: "taskCount",
      key: "taskCount",
      width: 110,
    },
    {
      title: "已完成",
      dataIndex: "completedCount",
      key: "completedCount",
      width: 90,
    },
    {
      title: "高风险",
      dataIndex: "highRiskCount",
      key: "highRiskCount",
      width: 90,
      render: (value) => (
        <span className={value > 0 ? "overall-overview__danger" : ""}>
          {value}
        </span>
      ),
    },
    {
      title: "覆盖模块",
      dataIndex: "modulesText",
      key: "modulesText",
      width: 220,
    },
  ];

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: "首页" }, { title: "总体评估概览" }]}
      />

      <PageTitle
        title="总体评估概览"
        subtitle="集中展示数据集、模型、智能体三类评估任务的整体态势，以及各领域单位与集团的参与情况。"
        actions={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => message.success("已刷新总体评估 mock 数据")}
          >
            刷新数据
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="总评估任务"
            value={overviewData.totalTasks}
            desc="三类评估任务汇总"
            icon={<BarChart3 size={22} />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="参与单位"
            value={overviewData.participatingOrganizations}
            desc="来自单位与集团的参与覆盖"
            icon={<Building2 size={22} />}
            color="#2f54eb"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="已完成"
            value={overviewData.completedTasks}
            desc="已形成正式评估结果"
            icon={<CheckCircle2 size={22} />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="综合平均分"
            value={overviewData.averageScore}
            desc={getScoreStatus(overviewData.averageScore)}
            icon={<Activity size={22} />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="近12个月总体评估任务数趋势分析"
            className="overall-overview-card"
            bordered={false}
          >
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTaskTrendData}
                  margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
                >
                  <defs>
                    {industryTrendMeta.map((item) => (
                      <linearGradient
                        key={item.key}
                        id={`trend-shadow-${item.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={item.color}
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor={item.color}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="#edf2fa" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    label={{
                      value: "任务数",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#667085", fontSize: 13, fontWeight: 600 },
                    }}
                  />
                  <Tooltip content={<MonthlyTrendTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                  {industryTrendMeta.map((item) => (
                    <Area
                      key={`${item.key}-shadow`}
                      type="monotone"
                      dataKey={item.key}
                      stroke="none"
                      fill={`url(#trend-shadow-${item.key})`}
                      isAnimationActive={false}
                      legendType="none"
                    />
                  ))}
                  {industryTrendMeta.map((item) => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      stroke={item.color}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
                      name={item.label}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="任务状态分布"
            className="overall-overview-card"
            bordered={false}
          >
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {overviewData.statusDistribution.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="overall-overview-legend">
              {overviewData.statusDistribution.map((item, index) => (
                <div key={item.name} className="overall-overview-legend__item">
                  <span
                    className="overall-overview-legend__dot"
                    style={{ background: pieColors[index % pieColors.length] }}
                  />
                  <span className="overall-overview-legend__label">
                    {item.name}
                  </span>
                  <span className="overall-overview-legend__value">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card
            title="近12个月三类评估任务分布"
            className="overall-overview-card"
            bordered={false}
          >
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTypeDistributionData}
                  barGap={8}
                  barCategoryGap="14%"
                >
                  <CartesianGrid stroke="#edf2fa" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    label={{
                      value: "任务数",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#667085", fontSize: 13, fontWeight: 600 },
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={32} />
                  <Bar
                    dataKey="data"
                    name="数据集评估"
                    fill="#1677ff"
                    radius={[0, 0, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="model"
                    name="模型评估"
                    fill="#52c41a"
                    radius={[0, 0, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="agent"
                    name="智能体评估"
                    fill="#fa8c16"
                    radius={[0, 0, 0, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="单位与集团参与情况"
        className="overall-overview-card"
        bordered={false}
      >
        <Table
          rowKey="organizationName"
          columns={organizationColumns}
          dataSource={overviewData.organizationParticipation}
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Card
        title="近期评估任务"
        className="overall-overview-card"
        bordered={false}
      >
        <Table
          rowKey="id"
          columns={taskColumns}
          dataSource={overviewData.recentTasks}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}

export default OverallEvaluationOverview;
