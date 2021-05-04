import * as React from 'react'
import { Checkbox, Button, Modal, InputNumber, Row, Col } from 'antd'
import { ApplicationState } from '../../../store/index'
import { useSelector, useDispatch } from 'react-redux'
import { onQueryChange } from '../../../store/queries/actions'

interface IQueryOptionsProps {
  tabId: string
}

const QueryOptions: React.FC<IQueryOptionsProps> = (props: IQueryOptionsProps) => {
  const dispatch = useDispatch()
  const { tabId } = props
  const includeDeleted: boolean = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].includeDeleted)
  const toolingMode: boolean = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].toolingMode)
  const batchSize: number = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].batchSize)

  const [showModal, setShowModal] = React.useState(false)

  const onIncludeDeletedChange = (event: any) => {
    dispatch(onQueryChange({ tabId, includeDeleted: event.target.checked }))
  }

  const onToolingModeChange = (event: any) => {
    dispatch(onQueryChange({ tabId, toolingMode: event.target.checked }))
  }

  const onBatchSizeChange = (value: number) => {
    dispatch(onQueryChange({ tabId, batchSize: value }))
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
