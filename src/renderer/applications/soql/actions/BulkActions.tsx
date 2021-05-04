import * as React from 'react'
import { DownOutlined } from '@ant-design/icons'
import { Menu, Dropdown, Modal } from 'antd'
import BulkUpdate from './BulkUpdate'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { onDelete } from '../../../store/queryResults/actions'

interface IBulkActionsProps {
  tabId: string
}

const BulkActions: React.FC<IBulkActionsProps> = (props: IBulkActionsProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const selectedIds: string[] = useSelector(
    (state: ApplicationState) =>
      state.queryResultsState.byTabId[tabId].selectedIds
  )

  const [showUpdateModal, setShowUpdateModal] = React.useState(false)

  const handleMenuClick = (param: any) => {
    switch (param.key) {
      case 'delete':
        confirmDelete()
        return
    }
  }

  const options = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key='delete'>Bulk Delete</Menu.Item>
    </Menu>
  )

  const bulkUpdateProps = {
    tabId,
    showModal: showUpdateModal,
    setShowModal: setShowUpdateModal
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <Dropdown.Button
        icon={<DownOutlined />}
        onClick={() => setShowUpdateModal(true)}
        disabled={selectedIds.length <= 0}
        overlay={options}
      >
        Bulk Update
      </Dropdown.Button>
      <BulkUpdate {...bulkUpdateProps} />
    </div>
  )

  function confirmDelete() {
    Modal.confirm({
      title: `This will delete ${selectedIds.length} records. Are you sure you want to proceed?`,
      okText: 'Yes',
      okType: 'default',
      cancelText: 'No',
      style: { top: 150 },
      onOk() {
        dispatch(onDelete(tabId))
      }
    })
  }
}

export default BulkActions
