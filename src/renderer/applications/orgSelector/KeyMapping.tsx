import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { EditOutlined } from '@ant-design/icons'
import { Row, Col } from 'antd'
import { ApplicationState } from '../../store/index'
import Hotkeys from '../ui/Hotkeys'
import hotkeys from 'hotkeys-js'
import * as os from 'os'
import { onUserChange } from '../../store/user/actions'

interface IKeyMappingProps {
  showModal: boolean
}

const KeyMapping: React.FC<any> = React.memo((props: IKeyMappingProps) => {
  const dispatch = useDispatch()
  const { showModal } = props
  const id: string = useSelector((state: ApplicationState) => state.userState.id)
  const queryHotkey: string = useSelector((state: ApplicationState) => state.userState.queryHotkey)

  const [editMode, setEditMode] = React.useState(false)
  const [keyCombo, setKeyCombo] = React.useState('')

  const onEdit = () => {
    setEditMode(true)
  }

  React.useEffect(() => {
    if (!showModal) {
      setEditMode(false)
      setKeyCombo('')
    }
  }, [showModal])

  React.useEffect(() => {
    if (editMode) {
      let keyCodeCombo = ''
      hotkeys.setScope('setting')
      hotkeys('*', 'setting', function (event, handler) {
        event.preventDefault()

        const isMac = os.type() === 'Darwin'

        if(hotkeys.isPressed('enter')) {
          hotkeys.deleteScope('setting')
          setEditMode(false)
          dispatch(onUserChange({ id, queryHotkey: keyCodeCombo }))
        } else if(hotkeys.isPressed('esc')) {
          hotkeys.deleteScope('setting')
          setEditMode(false)
        } else {
          const keys = hotkeys.getPressedKeyCodes()
            .filter(keyCode => [16, 18, 91, 17, 37, 38, 39, 40].includes(keyCode) || (keyCode >= 65 && keyCode <= 90))
            .map(keyCode => {
              switch (keyCode) {
                case 16:
                  return 'shift'
                case 18:
                  return isMac ? '⌥' : 'alt'
                case 91:
                  return isMac ? '⌘' : 'cmd'
                case 17:
                  return isMac ? '⌃' : 'ctrl'
                case 37:
                  return '◄'
                case 38:
                  return '▲'
                case 39:
                  return '►'
                case 40:
                  return '▼'
                default:
                  return String.fromCharCode(keyCode)
              }
            })
            //A variable is also being set because a listener has no reference to the changing hook value
            keyCodeCombo = keys.join('+')
            setKeyCombo(keys.join('+'))
        }

      })
    } else {
      hotkeys.unbind('*', 'setting')
    }

    return () => {
      hotkeys.unbind('*', 'setting')
    }
  }, [editMode])

  return (
    <Row justify='space-between' align='middle'>
      <Col span={6}>
        Execute query
        </Col>
      <Col span={2}>
        {renderIcons()}
      </Col>
      <Col span={16}>
        {renderHotkey()}
      </Col>
    </Row>
  )

  function renderIcons() {
    return editMode
      ? <></>
      : <EditOutlined onClick={onEdit} />
  }

  function renderHotkey() {
    return editMode
      ?
      <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: '6px 11px', height: 41 }}>
        <Hotkeys combination={keyCombo} />
      </div>
      : <Hotkeys combination={queryHotkey} />
  }
})

export default KeyMapping
