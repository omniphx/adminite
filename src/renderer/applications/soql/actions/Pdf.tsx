import * as React from 'react'
import { Table } from 'antd'

interface IPDFProps {
  data: any[]
}

const PDF: React.FC<IPDFProps> = (props: IPDFProps) => {
  const { data } = props

  return (
    <Table
      columns={getColumns()}
      dataSource={data}
      pagination={false}
    />
  )

  function getColumns() {
    if(!data || data.length <= 0) return []

    let firstRow = data[0]
    return Object.keys(firstRow).map(key => {
      return {
        title: key,
        dataIndex: key,
        key: key
      }
    })
  }
}

export default PDF