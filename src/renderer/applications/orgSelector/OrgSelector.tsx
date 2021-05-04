import * as React from 'react'
import {
  CaretDownOutlined,
  CloudTwoTone,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { Menu, Dropdown, Card, Tooltip } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { toggleModal } from '../../store/connections/actions'
import { ApplicationState } from '../../store/index'
import Meta from 'antd/lib/card/Meta'
import ConnectionCard from './ConnectionCard'
import { MdAddBox, MdSettings } from 'react-icons/md'
import IconWrapper from '../ui/IconWrapper'
import UserSettings from './UserSettings'

const OrgSelector: React.FC = React.memo((props: any) => {
  const dispatch = useDispatch()

  const connectionId: string = useSelector(
    (state: ApplicationState) => state.connectionState.connectionId
  )
  const pending: boolean = useSelector(
    (state: ApplicationState) => state.connectionState.pending
  )
  const error: any = useSelector(
    (state: ApplicationState) => state.connectionState.error
  )
  const connections: any[] = useSelector(
    (state: ApplicationState) => state.connectionsState.connections
  )
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [showUserSettingsModal, setShowUserSettingsModal] = React.useState(
    false
  )

  const connectionInfo = connections[connectionId]

  const handleNewOrg = () => {
    setShowDropdown(false)
    dispatch(toggleModal())
  }

  const handleUserSettings = () => {
    setShowDropdown(false)
    setShowUserSettingsModal(true)
  }

  const renderOrgOptions = () => {
    return Object.values(connections).map((connection: any, index) => {
      return (
        <ConnectionCard
          {...{ connection, setShowDropdown, index }}
          key={connection.id}
        />
      )
    })
  }

  const renderMenuDropDown = () => {
    return (
      <Menu
        style={{
          left: 100,
          overflow: 'hidden',
          overflowY: 'scroll',
          maxHeight: 600,
          display: !showDropdown ? 'none' : ''
        }}
        className='org-drop-down'
      >
        {renderOrgOptions()}
        <Menu.Item onClick={handleNewOrg} key='create'>
          <Card bordered={false} style={{ background: 'transparent' }}>
            <Meta
              avatar={
                <IconWrapper>
                  <MdAddBox />
                </IconWrapper>
              }
              description='New connection'
            />
          </Card>
        </Menu.Item>
        <Menu.Item onClick={handleUserSettings} key='settings'>
          <Card bordered={false} style={{ background: 'transparent' }}>
            <Meta
              avatar={
                <IconWrapper>
                  <MdSettings />
                </IconWrapper>
              }
              description='Settings'
            />
          </Card>
        </Menu.Item>
      </Menu>
    )
  }

  return (
    <div>
      <Dropdown
        overlay={renderMenuDropDown()}
        trigger={['click']}
        onVisibleChange={visible => setShowDropdown(visible)}
      >
        <a className='ant-dropdown-link' href='#' style={{ color: 'inherit' }}>
          <div
            className='hover'
            style={{
              padding: 24,
              fontWeight: 600,
              borderRight: '1px solid #e8e8e8'
            }}
          >
            {renderDropDown()}
          </div>
        </a>
      </Dropdown>
      <UserSettings
        {...{
          showModal: showUserSettingsModal,
          setShowModal: setShowUserSettingsModal
        }}
      />
    </div>
  )

  function renderDropDown() {
    return connectionInfo ? (
      //Has connection
      <span>
        {renderIcon()} {connectionInfo['name']} {renderCaret()}
      </span>
    ) : (
      //Has no connection
      <span>Connect to an Org {renderCaret()}</span>
    )
  }

  function renderIcon() {
    if (pending) {
      return <LoadingOutlined />
    } else if (error) {
      return (
        <Tooltip title={error} placement='bottomRight' arrowPointAtCenter>
          <InfoCircleOutlined className='icon-error' />
        </Tooltip>
      )
    } else {
      return <CloudTwoTone />
    }
  }

  function renderCaret() {
    const degrees: number = showDropdown ? 180 : 0
    //TODO: Clean up animation
    return <CaretDownOutlined rotate={degrees} />
  }
})

export default OrgSelector
