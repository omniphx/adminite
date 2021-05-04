import { useState, useEffect } from 'react'

export function useOnOffline() {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine)

  useEffect(() => {
    window.addEventListener('online',  setOnline)
    window.addEventListener('offline',  setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  function setOnline() {
    setIsOnline(true)
  }

  function setOffline() {
    setIsOnline(false)
  }

  return isOnline
}