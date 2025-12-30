import * as React from 'react'
import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Modal, Button, Space } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import BulkUpdate from './BulkUpdate'
import { useQueryResultStore, selectTabSelectedIds } from '../../../stores/useQueryResultStore'
import { useDmlDelete } from '../../../queries/useDmlMutations'

interface IBulkActionsProps {
  tabId: string
}

const BulkActions: React.FC<IBulkActionsProps> = (props: IBulkActionsProps) => {
  const { tabId } = props

  // Zustand for selected IDs (Phase 9) - memoize selector to avoid infinite loop
  const selectedIdsSelector = React.useCallback(selectTabSelectedIds(tabId), [tabId])
  const selectedIds = useQueryResultStore(useShallow(selectedIdsSelector))

  // TanStack Query mutation for DML delete (Phase 9)
  const dmlDelete = useDmlDelete()

  const [showUpdateModal, setShowUpdateModal] = React.useState(false)

  const handleMenuClick = (param: any) => {
    switch (param.key) {
      case 'delete':
        confirmDelete()
        return
    }
  }

  const menuItems = [
    { key: 'delete', label: 'Bulk Delete' }
  ]

  const bulkUpdateProps = {
    tabId,
    showModal: showUpdateModal,
    setShowModal: setShowUpdateModal
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <Space.Compact>
        <Button
          onClick={() => setShowUpdateModal(true)}
          disabled={selectedIds.length <= 0}
        >
          Bulk Update
        </Button>
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          disabled={selectedIds.length <= 0}
        >
          <Button disabled={selectedIds.length <= 0} icon={<DownOutlined />} />
        </Dropdown>
      </Space.Compact>
      <BulkUpdate {...bulkUpdateProps} />
    </div>
  )

  function confirmDelete() {
    Modal.confirm({
      title: `This will delete ${selectedIds.length} records. Are you sure you want to proceed?`,
      okText: 'Yes',
      okButtonProps: { type: 'default' },
      cancelText: 'No',
      style: { top: 150 },
      onOk() {
        dmlDelete.mutate(tabId)
      }
    })
  }
}

export default BulkActions
