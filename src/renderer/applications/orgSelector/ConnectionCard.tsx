import * as React from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Modal, Input, Tooltip } from 'antd';
import { useConnectionStore } from '../../stores/useConnectionStore';

const { Meta } = Card;
import { useDrag, useDrop } from 'react-dnd';

const { confirm } = Modal;

// Subtle grip dots icon for drag handle (2x3 dot pattern)
const GripDotsIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    width='8'
    height='14'
    viewBox='0 0 8 14'
    fill='currentColor'
    style={{ color: '#bfbfbf', ...style }}
  >
    <circle cx='2' cy='2' r='1.5' />
    <circle cx='6' cy='2' r='1.5' />
    <circle cx='2' cy='7' r='1.5' />
    <circle cx='6' cy='7' r='1.5' />
    <circle cx='2' cy='12' r='1.5' />
    <circle cx='6' cy='12' r='1.5' />
  </svg>
);

interface IConnectionCardProps {
  connection: any;
  setShowDropdown: any;
  index: number;
}

const ConnectionCard: React.FC<IConnectionCardProps> = React.memo((props: IConnectionCardProps) => {
  const { connection, setShowDropdown, index } = props;

  // Zustand store actions
  const setActiveConnectionId = useConnectionStore((state) => state.setActiveConnectionId);
  const updateConnection = useConnectionStore((state) => state.updateConnection);
  const deleteConnection = useConnectionStore((state) => state.deleteConnection);
  const moveConnection = useConnectionStore((state) => state.moveConnection);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const [editMode, setEditMode] = React.useState(false);
  const [connectionName, setConnectionName] = React.useState(connection.name);
  const [deleteHovered, setDeleteHovered] = React.useState(false);

  const [{ opacity, isDragging }, dragRef] = useDrag(() => ({
    type: 'connection',
    item: { id: connection.id, index },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ canDrop, isOver, item }, dropRef] = useDrop(() => ({
    accept: 'connection',
    drop: (item: any) => moveConnection(item.index, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.getItem(),
    }),
  }));

  const handleConnectionSelection = (connectionId: string) => {
    setShowDropdown(false);
    setActiveConnectionId(connectionId);
    // TanStack Query will automatically fetch identity when activeConnectionId changes
  };

  const handleDelete = (connectionId: string) => {
    setShowDropdown(false);
    deleteConnection(connectionId);
  };

  const handleEdit = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setEditMode(true);
  };

  const handleFocus = (event: any) => {
    event.stopPropagation();
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConnectionName(event.target.value);
  };

  const handleConfirmChange = () => {
    updateConnection(connection.id, { name: connectionName });
    setEditMode(false);
  };

  dropRef(dragRef(cardRef));

  const isActive = canDrop && isOver;
  const indexMatch = item && item.index === index;
  const indexBelow = item && item.index < index;

  const showTopBorder = isActive && !indexMatch && !indexBelow;
  const showBottomBorder = isActive && indexBelow;

  return (
    <div
      ref={cardRef}
      style={{
        opacity,
        borderTop: showTopBorder ? '2px dotted #1890ff' : undefined,
        borderBottom: showBottomBorder ? '2px dotted #1890ff' : undefined,
        cursor: isDragging ? 'grabbing' : 'pointer',
      }}
      onClick={() => handleConnectionSelection(connection.id)}
    >
      <Card
        hoverable
        size='small'
        variant='borderless'
        styles={{
          body: { padding: '12px 16px' },
        }}
        actions={[
          <EditOutlined key='edit' onClick={handleEdit} />,
          <DeleteOutlined
            key='delete'
            style={{ color: deleteHovered ? '#ff4d4f' : undefined }}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            onClick={(event) => showDeleteConfirm(event, connection)}
          />,
        ]}
      >
        <Meta
          avatar={
            <div style={{ cursor: isDragging ? 'grabbing' : 'grab', padding: '4px 0' }}>
              <GripDotsIcon />
            </div>
          }
          title={renderTitle()}
          description={
            <Tooltip title={connection.username} placement='rightTop'>
              <div className='truncate'>{connection.username}</div>
            </Tooltip>
          }
        />
      </Card>
    </div>
  );

  function renderTitle() {
    return editMode ? (
      <Input
        {...{ value: connectionName }}
        onChange={handleEditChange}
        onBlur={handleConfirmChange}
        onFocus={handleFocus}
        onClick={handleFocus}
        onPressEnter={handleConfirmChange}
        size='small'
        autoFocus
      />
    ) : (
      <span>{connection.name}</span>
    );
  }

  function showDeleteConfirm(event: any, connection: any) {
    event.stopPropagation();
    setShowDropdown(false);
    confirm({
      title: `Are you sure you want to delete ${connection.name}?`,
      okText: 'Yes',
      okButtonProps: { danger: true },
      cancelText: 'No',
      onOk() {
        handleDelete(connection.id);
      },
    });
  }
});

export default ConnectionCard;
