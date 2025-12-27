import * as React from 'react'
import { Alert } from 'antd'
import { GiSadCrab } from 'react-icons/gi';
import { useQueryResultStore, selectTabErrors } from '../../../stores/useQueryResultStore';

interface IErrorAlertProps {
  tabId: string
}

const ErrorAlert: React.FC<IErrorAlertProps> = React.memo((props: IErrorAlertProps) => {
  const { tabId } = props
  // Zustand for query results errors (Phase 9)
  const errors = useQueryResultStore(selectTabErrors(tabId))

  const errorComponent = <pre className='mono-font'>{errors}</pre>

  return (
    <Alert
      message='Dang...'
      description={errorComponent}
      type='error'
      showIcon
      icon={<GiSadCrab/>}
    />
  )
})

export default ErrorAlert
