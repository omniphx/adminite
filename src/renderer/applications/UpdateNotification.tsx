import * as React from 'react'
import { Button } from 'antd'
import { ipcRenderer } from 'electron'

const UpdateNotification = React.memo((props: any) => {
  const [updateAvailable, setUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    ipcRenderer.on('update-downloaded', updateListener)
    return () => {
      ipcRenderer.removeListener('update-downloaded', updateListener)
    }
  }, [])

  const handleUpdate = () => {
    ipcRenderer.send('start-update')
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
