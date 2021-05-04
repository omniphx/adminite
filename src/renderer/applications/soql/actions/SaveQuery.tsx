import * as React from 'react'
import { Button, Modal, Input, Form } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { onQueryChange } from '../../../store/queries/actions'
import { SoqlQuery } from '../../../store/queries/types'
import {
  createSoqlQuery,
  updateSoqlQuery
} from '../../../../helpers/local-store'
import { isQueryValid, parseQuery } from 'soql-parser-js'

interface ISaveQueryProps {
  tabId: string
}

const SaveQuery: React.FC<ISaveQueryProps> = (props: ISaveQueryProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const query: SoqlQuery = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].query
  )

  const [visible, setVisible] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')

  const showModal = () => {
    setVisible(true)
  }

  const handleSave = async (event: any) => {
    try {
      const { name, body } = query
      const sobject = isQueryValid(body) ? parseQuery(body).sObject : 'Invalid'
      const result: any = await createSoqlQuery({ name, body, sobject })
      setVisible(false)
      dispatch(onQueryChange({ tabId, query: result }))
    } catch (error) {
      console.error(error)
      setSaveError(error)
    }
  }

  const handleUpdate = async (event: any) => {
    try {
      const { id, name, body } = query
      const sobject = isQueryValid(body) ? parseQuery(body).sObject : 'Invalid'
      const result: any = await updateSoqlQuery({ id, name, body, sobject })
      setVisible(false)
      dispatch(onQueryChange({ tabId, query: result }))
    } catch (error) {
      console.error(error)
      setSaveError(error)
    }
  }

  const handleCancel = (event: any) => {
    setVisible(false)
  }

  const handleNameChange = (event: any) => {
    dispatch(
      onQueryChange({ tabId, query: { ...query, name: event.target.value } })
    )
  }

  let saveActions = [
    <Button key='back' onClick={handleCancel}>
      Cancel
    </Button>
  ]

  if (query.id) {
    saveActions.push(
      <Button key='save' type='primary' onClick={handleUpdate}>
        Update
      </Button>
    )
  }

  saveActions.push(
    <Button key='saveAs' type='primary' onClick={handleSave}>
      {query.id ? 'Save As' : 'Save'}
    </Button>
  )

  return (
    <div style={{ display: 'inline-block' }}>
      <Button type='link' onClick={showModal} disabled={query.body.length <= 0}>
        Save Query
      </Button>
      <Modal
        title='Save Query'
        visible={visible}
        onCancel={handleCancel}
        footer={saveActions}
      >
        <Input value={query.name} onChange={handleNameChange} />
        {saveError}
      </Modal>
    </div>
  )
}

export default SaveQuery
