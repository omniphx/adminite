import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from 'antd'
import { ApplicationState } from '../../../store/index'
import { onUpdate } from '../../../store/queryResults/actions'

interface ISaveEditsProps {
  tabId: string
}

const SaveEdits: React.FC<ISaveEditsProps> = (props: ISaveEditsProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const data: any = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].data)
  const pending: boolean = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].dmlPending)

  const handleSave = async () => {
    try {
      dispatch(onUpdate(tabId))
    } catch(error) {
      console.error(error)
    }
  }

  return (
    <div className='button-style'>
      <Button type='link' onClick={handleSave} loading={pending} disabled={!hasEdits()}>
        Save Changes
      </Button>
    </div>
  )

  function hasEdits(): boolean {
    return Object.values(data).some((record: any) => record.editFields.length > 0)
  }
}

export default SaveEdits