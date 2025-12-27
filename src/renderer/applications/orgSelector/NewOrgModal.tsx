import * as React from 'react'
import { Modal, Input, Select, Button, Form } from 'antd'
import { ipcRenderer } from 'electron'
import { useConnectionStore } from '../../stores/useConnectionStore'

const NewOrgModal: React.FC<any> = React.memo((props: any) => {
  const [form] = Form.useForm()
  const [customUrl, setCustomUrl] = React.useState('')
  const [showCustomUrl, setShowCustomUrl] = React.useState(false)

  // Zustand store
  const modalVisible = useConnectionStore((state) => state.modalVisible)
  const toggleModal = useConnectionStore((state) => state.toggleModal)

  React.useEffect(() => {
    if (modalVisible === true) {
      form.resetFields()
      setShowCustomUrl(false)
      setCustomUrl('')
    }
  }, [modalVisible])

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      const result = await form.validateFields()
      switch (result.environment) {
        case 'sandbox':
          result.url = 'https://test.salesforce.com'
          break
        case 'custom':
          result.url = `https://${result.url}`
          break
        default:
          result.url = 'https://login.salesforce.com'
          break
      }

      ipcRenderer.send('create-new-connection', result)
    } catch (exception) {
      console.error(exception)
    }
  }

  const handleCancel = () => {
    toggleModal()
  }

  const handleEnvironmentChange = value => {
    setShowCustomUrl(value === 'custom')
  }

  const handleCustomUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomUrl(event.target.value)
  }

  const formProps = {
    form,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 }
    }
  }

  return (
    <Modal
      visible={modalVisible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      footer={[
        <Button key='cancel' onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key='submit'
          form='new_connection'
          type='primary'
          htmlType='submit'
          onClick={handleSubmit}
        >
          Connect
        </Button>
      ]}
    >
      <Form
        {...formProps}
        onFinish={handleSubmit}
        name='new_connection'
        fields={[
          {
            name: 'environment',
            value: 'production'
          }
        ]}
      >
        <Form.Item
          label='Name'
          style={{ marginTop: '2em' }}
          key='name'
          name='name'
          rules={[{ required: true, message: 'Please provide a name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Environment'
          key='environment'
          name='environment'
          rules={[{ required: true, message: 'Please select an environment' }]}
        >
          <Select onChange={handleEnvironmentChange}>
            <Select.Option value='production' key='production'>
              Production
            </Select.Option>
            <Select.Option value='sandbox' key='sandbox'>
              Sandbox
            </Select.Option>
            <Select.Option value='custom' key='custom'>
              Custom
            </Select.Option>
          </Select>
        </Form.Item>
        {renderCustomUrl()}
      </Form>
    </Modal>
  )

  function renderCustomUrl() {
    return showCustomUrl ? (
      <div>
        <Form.Item
          label='Url'
          name='url'
          rules={[{ required: true, message: 'Please provide a url' }]}
        >
          <Input onChange={handleCustomUrlChange} />
        </Form.Item>
        <span>
          <code className='code'>https://{customUrl}</code>
        </span>
      </div>
    ) : (
      <div />
    )
  }
})

export default NewOrgModal
