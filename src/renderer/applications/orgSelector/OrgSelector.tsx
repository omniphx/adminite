import * as React from 'react';
import {
  CaretDownOutlined,
  CloudTwoTone,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Dropdown, Card, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { useConnectionStore, useConnectionsArray } from '../../stores/useConnectionStore';

const { Meta } = Card;
import ConnectionCard from './ConnectionCard';
import { MdAddBox, MdSettings } from 'react-icons/md';
import IconWrapper from '../ui/IconWrapper';
import UserSettings from './UserSettings';

const OrgSelector: React.FC = React.memo(() => {
  // Zustand store - select primitive values to avoid reference instability
  const connections = useConnectionsArray();
  const activeConnectionName = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.name : null
  );
  const pending = useConnectionStore((state) => state.activeConnection.pending);
  const error = useConnectionStore((state) => state.activeConnection.error);
  const toggleModal = useConnectionStore((state) => state.toggleModal);

  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = React.useState(false);

  const handleNewOrg = () => {
    setShowDropdown(false);
    toggleModal();
  };

  const handleUserSettings = () => {
    setShowDropdown(false);
    setShowUserSettingsModal(true);
  };

  const getMenuItems = (): MenuProps['items'] => {
    const connectionItems = connections.map((connection: any, index) => ({
      key: connection.id,
      label: <ConnectionCard {...{ connection, setShowDropdown, index }} />,
    }));

    return [
      ...connectionItems,
      {
        key: 'create',
        onClick: handleNewOrg,
        label: (
          <Card variant='borderless' style={{ background: 'transparent' }}>
            <Meta
              avatar={
                <IconWrapper>
                  <MdAddBox />
                </IconWrapper>
              }
              description='New connection'
            />
          </Card>
        ),
      },
      {
        key: 'settings',
        onClick: handleUserSettings,
        label: (
          <Card variant='borderless' style={{ background: 'transparent' }}>
            <Meta
              avatar={
                <IconWrapper>
                  <MdSettings />
                </IconWrapper>
              }
              description='Settings'
            />
          </Card>
        ),
      },
    ];
  };

  const menuProps: MenuProps = {
    items: getMenuItems(),
    style: {
      left: 100,
      overflow: 'hidden',
      overflowY: 'scroll',
      maxHeight: 600,
      display: !showDropdown ? 'none' : '',
    },
    className: 'org-drop-down',
  };

  return (
    <div>
      <Dropdown
        menu={menuProps}
        trigger={['click']}
        onOpenChange={(visible) => setShowDropdown(visible)}
      >
        <a className='ant-dropdown-link' href='#' style={{ color: 'inherit' }}>
          <div
            className='hover'
            style={{
              padding: 24,
              fontWeight: 600,
              borderRight: '1px solid #e8e8e8',
            }}
          >
            {renderDropDown()}
          </div>
        </a>
      </Dropdown>
      <UserSettings
        {...{
          showModal: showUserSettingsModal,
          setShowModal: setShowUserSettingsModal,
        }}
      />
    </div>
  );

  function renderDropDown() {
    return activeConnectionName ? (
      //Has connection
      <span>
        {renderIcon()} {activeConnectionName} {renderCaret()}
      </span>
    ) : (
      //Has no connection
      <span>Connect to an Org {renderCaret()}</span>
    );
  }

  function renderIcon() {
    if (pending) {
      return <LoadingOutlined />;
    } else if (error) {
      return (
        <Tooltip title={error} placement='bottomRight' arrow={{ pointAtCenter: true }}>
          <InfoCircleOutlined className='icon-error' />
        </Tooltip>
      );
    } else {
      return <CloudTwoTone />;
    }
  }

  function renderCaret() {
    const degrees: number = showDropdown ? 180 : 0;
    //TODO: Clean up animation
    return <CaretDownOutlined rotate={degrees} />;
  }
});

export default OrgSelector;
