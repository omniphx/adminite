import { useEffect, useCallback, RefObject } from 'react'

type KeyHandler = (key: string, event: KeyboardEvent) => void

interface UseKeyboardShortcutOptions {
  keys: string[]
  onKeyEvent: KeyHandler
  target?: RefObject<HTMLElement>
  enabled?: boolean
}

const normalizeKey = (event: KeyboardEvent): string => {
  const keys: string[] = []

  if (event.shiftKey && event.key !== 'Shift') keys.push('shift')
  if (event.ctrlKey && event.key !== 'Control') keys.push('ctrl')
  if (event.altKey && event.key !== 'Alt') keys.push('alt')
  if (event.metaKey && event.key !== 'Meta') keys.push('meta')

  const key = event.key.toLowerCase()

  // Map special keys
  const keyMap: { [key: string]: string } = {
    'escape': 'esc',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right'
  }

  const normalizedKey = keyMap[key] || key
  keys.push(normalizedKey)

  return keys.join('+')
}

/**
 * Custom hook to handle keyboard shortcuts
 *
 * @param options - Configuration object
 * @param options.keys - Array of key combinations to listen for (e.g., ['enter', 'esc', 'shift+tab'])
 * @param options.onKeyEvent - Callback function called when a matching key is pressed
 * @param options.target - Optional ref to limit event handling to a specific element and its children
 * @param options.enabled - Optional flag to enable/disable the handler (default: true)
 */
export const useKeyboardShortcut = ({
  keys,
  onKeyEvent,
  target,
  enabled = true
}: UseKeyboardShortcutOptions) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const pressedKey = normalizeKey(event)

      if (keys.includes(pressedKey)) {
        onKeyEvent(pressedKey, event)
      }
    },
    [keys, onKeyEvent, enabled]
  )

  useEffect(() => {
    const element = target?.current || document

    element.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [handleKeyDown, target])
}
