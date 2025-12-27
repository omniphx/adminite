import * as React from 'react'
import { Checkbox, Button, Modal, InputNumber, Row, Col } from 'antd'
import { useTabStore } from '../../../stores/useTabStore'

interface IQueryOptionsProps {
  tabId: string
}

const QueryOptions: React.FC<IQueryOptionsProps> = (props: IQueryOptionsProps) => {
  const { tabId } = props

  // Zustand store
  const queryState = useTabStore((state) => state.queries[tabId])
  const setIncludeDeleted = useTabStore((state) => state.setIncludeDeleted)
  const setToolingMode = useTabStore((state) => state.setToolingMode)
  const setBatchSize = useTabStore((state) => state.setBatchSize)

  const includeDeleted = queryState?.includeDeleted ?? false
  const toolingMode = queryState?.toolingMode ?? false
  const batchSize = queryState?.batchSize ?? 200

  const [showModal, setShowModal] = React.useState(false)

  const onIncludeDeletedChange = (event: any) => {
    setIncludeDeleted(tabId, event.target.checked)
  }

  const onToolingModeChange = (event: any) => {
    setToolingMode(tabId, event.target.checked)
  }

  const onBatchSizeChange = (value: number) => {
    setBatchSize(tabId, value)
  }

  const showOptionsModal = () => {
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  return (
    <div className='button-style'>
      <Button type='link' onClick={showOptionsModal}>
        Options
      </Button>
      <Modal
        title='Query options'
        onCancel={handleClose}
        visible={showModal}
        footer={[
          <Button key='back' onClick={handleClose}>
            Close
          </Button>,
        ]}
      >
        <Row>
          <Checkbox onChange={onToolingModeChange} checked={toolingMode}>
            Tooling API
          </Checkbox>
        </Row>
        <Row>
          <Checkbox onChange={onIncludeDeletedChange} checked={includeDeleted}>
            Include deleted records?
          </Checkbox>
        </Row>
        <Row justify='space-between' align='middle'>
          <Col span={18}>
            Batch size for DML (Must be between 0-200)
          </Col>
          <Col span={6}>
            <InputNumber
              onChange={onBatchSizeChange}
              value={batchSize}
              style={{width:'100%'}}
              max={200}
              min={0}/>
          </Col>
        </Row>
      </Modal>
    </div>
  )
}

export default QueryOptions
