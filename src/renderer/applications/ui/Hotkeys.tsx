import * as React from 'react'

interface IKeyProps {
  combination: string
}

const Hotkeys: React.FC<IKeyProps> = (props: IKeyProps) => {
  const { combination } = props

  const keys = combination
    .split('+')
    .map<React.ReactNode>(hotkey => {
      return (
        <span className='hotkeys' key={hotkey}>
          {hotkey}
        </span>
      )
    })
    .reduce((previous, current) => [previous, ' + ', current])
  
  return <>{combination.length > 0 ? keys : ''}</>
}

export default Hotkeys