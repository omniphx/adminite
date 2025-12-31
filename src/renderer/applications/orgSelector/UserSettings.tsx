import * as React from 'react';
import { Modal, Button, Checkbox, Tooltip, Row } from 'antd';
import { useUserStore } from '../../stores/useUserStore';

interface IUserSettingsProps {
  setShowModal(show: boolean);
  showModal: boolean;
}

const UserSettings: React.FC<any> = React.memo((props: IUserSettingsProps) => {
  const { setShowModal, showModal } = props;
  const disableAutoComplete = useUserStore((state) => state.disableAutoComplete);
  const disableInlineTabs = useUserStore((state) => state.disableInlineTabs);
  const setDisableAutoComplete = useUserStore((state) => state.setDisableAutoComplete);
  const setDisableInlineTabs = useUserStore((state) => state.setDisableInlineTabs);

  const onDisableAutoComplete = (event: any) => {
    setDisableAutoComplete(event.target.checked);
  };

  const onDisableInlineTabs = (event: any) => {
    setDisableInlineTabs(event.target.checked);
  };

  return (
    <Modal
      onCancel={() => setShowModal(false)}
      open={showModal}
      footer={[
        <Button key='back' onClick={() => setShowModal(false)}>
          Close
        </Button>,
      ]}
    >
      <Row>
        <div
          style={{
            fontWeight: 500,
            fontSize: 16,
            paddingBottom: 7,
          }}
        >
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
  );
});

export default UserSettings;
