import * as React from 'react'
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons'
import { Card, Row, Col, Modal, Input, Tooltip } from 'antd'
import { useDispatch } from 'react-redux'
import {
  onConnectionDelete,
  moveConnection
} from '../../store/connections/actions'
import Meta from 'antd/lib/card/Meta'
import { useDrag, useDrop } from 'react-dnd-cjs'
import { GoKebabVertical } from 'react-icons/go'
import { onConnectionChange } from '../../store/connections/actions'
import { onConnectionSelected } from '../../store/connection/actions'

const { confirm } = Modal

interface IConnectionCardProps {
  connection: any
  setShowDropdown: any
  index: number
}

const ConnectionCard: React.FC<IConnectionCardProps> = React.memo(
  (props: IConnectionCardProps) => {
    const { connection, setShowDropdown, index } = props
    const dispatch = useDispatch()
    const cardRef = React.useRef()

    const [editMode, setEditMode] = React.useState(false)
    const [connectionName, setConnectionName] = React.useState(connection.name)

    const [{ opacity, isDragging }, dragRef] = useDrag({
      item: { type: 'connection', id: connection.id, index },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        isDragging: monitor.isDragging()
      })
    })

    const [{ canDrop, isOver, item }, dropRef] = useDrop({
      accept: 'connection',
      drop: (item: any) => dispatch(moveConnection(item.index, index)),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem()
      })
    })

    const handleConnectionSelection = connectionId => {
      setShowDropdown(false)
      dispatch(onConnectionSelected(connectionId))
    }

    const handleDelete = connectionId => {
      setShowDropdown(false)
      dispatch(onConnectionDelete(connectionId))
    }

    const handleEdit = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.stopPropagation()
      setEditMode(true)
    }

    const handleFocus = (event: any) => {
      event.stopPropagation()
    }

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setConnectionName(event.target.value)
    }

    const handleConfirmChange = () => {
      dispatch(onConnectionChange({ ...connection, name: connectionName }))
      setEditMode(false)
    }

    dropRef(dragRef(cardRef))

    const isActive = canDrop && isOver
    const indexMatch = item && item.index === index
    const indexBelow = item && item.index < index

    const showTopBorder = isActive && !indexMatch && !indexBelow
    const showBottomBorder = isActive && indexBelow

    return (
      <div
        key={connection.id}
        className='ant-dropdown-menu-item'
        ref={cardRef}
        style={{
          paddingLeft: 0,
          opacity,
          borderTop: showTopBorder ? '2px dotted #1890ff' : '',
          borderBottom: showBottomBorder ? '2px dotted #1890ff' : ''
        }}
        onClick={() => handleConnectionSelection(connection.id)}
      >
        <Card bordered={false} style={{ background: 'transparent' }}>
          <Row justify='space-between'>
            <Col span={3}>
              <div
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  height: '100%',
                  padding: '5px',
                  textAlign: 'center'
                }}
              >
                <GoKebabVertical
                  style={{ fontSize: '1.5em', color: '#bfbfbf' }}
                />
              </div>
            </Col>
            <Col span={19}>
              <Meta
                title={renderTitle()}
                description={
                  <Tooltip title={connection.username} placement='rightTop'>
                    <div className='truncate'>{connection.username}</div>
                  </Tooltip>
                }
              />
            </Col>
            <Col span={2} style={{ textAlign: 'center' }}>
              <DeleteTwoTone
                twoToneColor='#595959'
                style={{ fontSize: '1em' }}
                onClick={event => showDeleteConfirm(event, connection)}
              />
            </Col>
          </Row>
        </Card>
      </div>
    )

    function renderTitle() {
      return editMode ? (
        <Input
          {...{ value: connectionName }}
          onChange={handleEditChange}
          onBlur={handleConfirmChange}
          onFocus={handleFocus}
          onClick={handleFocus}
          onPressEnter={handleConfirmChange}
          style={{ marginRight: 10 }}
          size='small'
          autoFocus
        />
      ) : (
        <span>
          {connection.name}&nbsp;
          <a onClick={handleEdit}>
            <EditOutlined className='edit-icon' style={{ fontSize: '.8em' }} />
          </a>
        </span>
      )
    }

    function showDeleteConfirm(event: any, connection: any) {
      event.stopPropagation()
      setShowDropdown(false)
      confirm({
        title: `Are you sure you want to delete ${connection.name}?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          handleDelete(connection.id)
        }
      })
    }
  }
)

export default ConnectionCard
