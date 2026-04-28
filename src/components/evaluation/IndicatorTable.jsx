import { Card, Table } from 'antd'
import RiskTag from './RiskTag.jsx'
import './evaluationComponents.css'

function IndicatorTable({ indicatorResults = [] }) {
  const columns = [
    {
      title: '一级维度',
      dataIndex: 'dimensionName',
      key: 'dimensionName',
      width: 160,
    },
    {
      title: '指标名称',
      dataIndex: 'indicatorName',
      key: 'indicatorName',
      width: 220,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 90,
      render: (value) => `${value}%`,
    },
    {
      title: '是否关键项',
      dataIndex: 'critical',
      key: 'critical',
      width: 110,
      render: (value) =>
        value ? (
          <span className="eval-indicator-table__critical">是</span>
        ) : (
          <span className="eval-indicator-table__normal">否</span>
        ),
    },
    {
      title: '原始评分',
      dataIndex: 'rawScore',
      key: 'rawScore',
      width: 110,
    },
    {
      title: '折算分',
      dataIndex: 'convertedScore',
      key: 'convertedScore',
      width: 110,
    },
    {
      title: '评价结论',
      dataIndex: 'conclusion',
      key: 'conclusion',
      width: 120,
      render: (value, record) => (
        <RiskTag
          type={
            record.rawScore >= 4
              ? 'success'
              : record.rawScore >= 3
                ? 'processing'
                : record.rawScore >= 2
                  ? 'warning'
                  : 'danger'
          }
        >
          {value}
        </RiskTag>
      ),
    },
  ]

  return (
    <Card className="eval-indicator-table" bordered={false}>
      <Table
        rowKey="indicatorId"
        columns={columns}
        dataSource={indicatorResults}
        pagination={false}
        scroll={{ x: 900 }}
      />
    </Card>
  )
}

export default IndicatorTable
