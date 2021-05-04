import * as React from 'react'
import { isQueryValid } from 'soql-parser-js'
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../store/index'
import { SoqlQuery } from '../../store/queries/types'

interface IQueryValidatorProps {
  tabId: string
}

const QueryValidator: React.FC<IQueryValidatorProps> = (props: IQueryValidatorProps) => {
  const { tabId } = props
  const query: SoqlQuery = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].query)

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