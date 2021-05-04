import * as React from 'react'

const IconWrapper: React.FC<any> = (props: any) => {
  return (
    <i aria-label='icon: security-scan' className='anticon anticon-security-scan'>
      {props.children}
    </i>
  )
}

export default IconWrapper