import * as React from 'react'

interface IAutoCompleteProps {
  dataSource: any
  topPosition: any
  leftPosition: any
  index: number
  onSelect(value: String): void
}

const AutoComplete: React.FC<IAutoCompleteProps> = (props: IAutoCompleteProps) => {
  const dropDownReference = React.useRef()
  const { index, dataSource, onSelect } = props

  const onItemSelect = (event, itemIndex) => {
    onSelect(dataSource[itemIndex])
  }

  function renderMenuItems() {
    return dataSource.slice(0, 10).map((item, itemIndex) => {  
      return (
        <div
          className={
            itemIndex === index
              ? 'ant-select-item ant-select-item-option ant-select-item-option-active'
              : 'ant-select-item ant-select-item-option'
          }
          onClick={event => onItemSelect(event, itemIndex)}
          key={item.name}
        >
          {item.label ? `${item.name} (${item.label})` : `${item.name}`}
        </div>
      )
    })
  }

  return (
    <div
      ref={dropDownReference}
      className='ant-select-dropdown ant-select-dropdown-placement-bottomLeft'
      style={{
        left: props.leftPosition,
        top: props.topPosition
      }}
    >
      {renderMenuItems()}
    </div>
  )
}

export default AutoComplete
