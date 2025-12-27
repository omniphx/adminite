import * as React from 'react'
import { isQueryValid } from 'soql-parser-js'
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons'
import { useTabStore, SoqlQuery } from '../../stores/useTabStore'

interface IQueryValidatorProps {
  tabId: string
}

const QueryValidator: React.FC<IQueryValidatorProps> = (props: IQueryValidatorProps) => {
  const { tabId } = props
  const query: SoqlQuery = useTabStore((state) => state.queries[tabId]?.query) ?? { body: '' }

  const icon = isQueryValid(query.body)
    ? <CheckCircleTwoTone twoToneColor='#52c41a' />
   : <CloseCircleTwoTone twoToneColor='#f5222d' />

  return (
    <div style={{ position: 'absolute', zIndex: 1000, right: 9, top: 5, fontSize: '1.1em' }}>
      {icon}
    </div>
  )
}

export default QueryValidator