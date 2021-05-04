import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal, Button, Checkbox, Tooltip, Row } from 'antd'
import { ApplicationState } from '../../store/index'
import { onUserChange } from '../../store/user/actions'
// import KeyMapping from './keyMapping'

interface IUserSettingsProps {
  setShowModal(show: boolean)
  showModal: boolean
}

const UserSettings: React.FC<any> = React.memo((props: IUserSettingsProps) => {
  const { setShowModal, showModal } = props
  const dispatch = useDispatch()
  const id: string = useSelector((state: ApplicationState) => state.userState.id)
  const disableAutoComplete: boolean = useSelector((state: ApplicationState) => state.userState.disableAutoComplete)
  const disableInlineTabs: boolean = useSelector((state: ApplicationState) => state.userState.disableInlineTabs)

  const onDisableAutoComplete = (event: any) => {
    dispatch(onUserChange({ disableAutoComplete: event.target.checked, id }))
  }

  const onDisableInlineTabs = (event: any) => {
    dispatch(onUserChange({ disableInlineTabs: event.target.checked, id }))
  }

  return (
    <Modal
      onCancel={() => setShowModal(false)}
      visible={showModal}
      footer={[
        <Button key='back' onClick={() => setShowModal(false)}>
          Close
        </Button>
      ]}
    >
      <Row>
        <div style={{
          fontWeight: 500,
          fontSize: 16,
          paddingBottom: 7
        }}>
          Settings
        </div>
      </Row>
      <Row>
        <Tooltip title='Disable auto-completion in the query editor' placement='rightTop'>
          <Checkbox onChange={onDisableAutoComplete} checked={disableAutoComplete}>
            Disable auto-complete
          </Checkbox>
        </Tooltip>
      </Row>
      <Row>
        <Tooltip title='Disable the ability to tab in the query editor' placement='rightTop'>
          <Checkbox onChange={onDisableInlineTabs} checked={disableInlineTabs}>
            Disable tabbing
          </Checkbox>
        </Tooltip>
      </Row>
      {/* <Divider dashed/>
      <Row>
        <div style={{
          fontWeight: 500,
          fontSize: 16
        }}>
          Hotkeys
        </div>
      </Row>
      <KeyMapping {...{showModal}}/> */}
    </Modal>
  )
})

export default UserSettings
