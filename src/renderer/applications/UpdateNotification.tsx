import * as React from 'react'
import { Button } from 'antd'

const UpdateNotification = React.memo((props: any) => {
  const [updateAvailable, setUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    const cleanup = window.electronAPI.onUpdateDownloaded(updateListener);
    return cleanup;
  }, [])

  const handleUpdate = () => {
    window.electronAPI.startUpdate();
  }

  if (!updateAvailable) return <div />

  return (
    <Button
      style={{ padding: 0 }}
      type='link'
      onClick={handleUpdate}
    >
      Install update
    </Button>
  )

  function updateListener() {
    setUpdateAvailable(true)
  }
})

export default UpdateNotification
