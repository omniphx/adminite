import * as React from 'react'
import { Button } from 'antd'
import { useQueryResultStore, selectTabData, selectTabDmlPending } from '../../../stores/useQueryResultStore'
import { useDmlUpdate } from '../../../queries/useDmlMutations'

interface ISaveEditsProps {
  tabId: string
}

const SaveEdits: React.FC<ISaveEditsProps> = (props: ISaveEditsProps) => {
  const { tabId } = props

  // Zustand for query results data (Phase 9)
  const data = useQueryResultStore(selectTabData(tabId))
  const pending = useQueryResultStore(selectTabDmlPending(tabId))

  // TanStack Query mutation for DML updates (Phase 9)
  const dmlUpdate = useDmlUpdate()

  const handleSave = async () => {
    try {
      dmlUpdate.mutate(tabId)
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
    return Object.values(data).some((record: any) => record.editFields?.length > 0)
  }
}

export default SaveEdits
