import * as React from 'react'
import { Alert } from 'antd'
import { GiSadCrab } from 'react-icons/gi';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../../store/index';

interface IErrorAlertProps {
  tabId: string
}

const ErrorAlert: React.FC<IErrorAlertProps> = React.memo((props: IErrorAlertProps) => {
  const { tabId } = props
  const errors: any = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].errors)

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
