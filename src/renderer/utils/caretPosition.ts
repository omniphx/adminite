// Converted this into typescript from https://github.com/component/textarea-caret-position

declare var window: Window

export interface CaretLocator {
  top: number
  left: number
  height: number
}

export class Caret {
  private textArea: HTMLTextAreaElement

  constructor(textArea: HTMLTextAreaElement) {
    this.textArea = textArea
  }

  // We'll copy the properties below into the mirror div.
  // Note that some browsers, such as Firefox, do not concatenate properties
  // into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
  // so we have to list every single property explicitly.
  private properties = [
    'direction', // RTL support
    'boxSizing',
    'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY', // copy the scrollbar for IE

    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',

    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',

    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration', // might not make a difference, but better be safe

    'letterSpacing',
    'wordSpacing',

    'tabSize',
    'MozTabSize'
  ]

  private isBrowser = typeof window !== 'undefined'
  private isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

  public getCoordinates = (position: number): CaretLocator => {
    if (!this.isBrowser) {
      throw new Error(
        'textarea-caret-position#getCaretCoordinates should only be called in a browser'
      )
    }

    // The mirror div will replicate the textarea's style
    const div = document.createElement('div')
    div.id = 'input-textarea-caret-position-mirror-div'
    document.body.appendChild(div)

    const style = div.style
    const computed: any = window.getComputedStyle(this.textArea)

    // Default textarea styles
    style.whiteSpace = 'pre-wrap'

    // Position off-screen
    style.position = 'absolute' // required to return coordinates properly

    // Transfer the element's properties to the div
    this.properties.forEach(prop => {
      style[prop] = computed[prop]
    })

    if (this.isFirefox) {
      // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
      if (this.textArea.scrollHeight > parseInt(computed['height'])) {
        style.overflowY = 'scroll'
      }
    } else {
      style.overflow = 'hidden' // for Chrome to not render a scrollbar IE keeps overflowY = 'scroll'
    }

    const contentAtPosition = this.textArea.value.substring(0, position)
    div.textContent = contentAtPosition

    const span = document.createElement('span')
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // For inputs, just '.' would be enough, but no need to bother.
    span.textContent = this.textArea.value.substring(position) || '.' // || because a completely empty faux span doesn't render at all
    div.appendChild(span)

    const coordinates: CaretLocator = {
      top: span.offsetTop + parseInt(computed['borderTopWidth']),
      left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
      height: parseInt(computed['lineHeight'])
    }

    document.body.removeChild(div)

    return coordinates
  }

  public setPosition = (start: number, end?: number) => {
    if (!this.textArea) return
    if(!end) end = start
    this.textArea.focus()
    this.textArea.setSelectionRange(start, end)
  }
}
