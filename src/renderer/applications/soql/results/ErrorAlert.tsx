import * as React from 'react'
import { Alert } from 'antd'
import { GiSadCrab } from 'react-icons/gi';
import { useQueryResultStore, selectTabErrors } from '../../../stores/useQueryResultStore';

interface IErrorAlertProps {
  tabId: string
}

const ErrorAlert: React.FC<IErrorAlertProps> = React.memo((props: IErrorAlertProps) => {
  const { tabId } = props
  // Zustand for query results errors (Phase 9) - memoize selector to avoid infinite loop
  const errorsSelector = React.useCallback(selectTabErrors(tabId), [tabId])
  const errors = useQueryResultStore(errorsSelector)

  const errorComponent = <pre className='mono-font'>{errors}</pre>

  return (
    <Alert
      title='Dang...'
      description={errorComponent}
      type='error'
      showIcon
      icon={<GiSadCrab/>}
    />
  )
})

export default ErrorAlert
