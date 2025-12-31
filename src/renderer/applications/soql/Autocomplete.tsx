import { useRef } from 'react';

interface IAutoCompleteProps {
  dataSource: any;
  topPosition: any;
  leftPosition: any;
  index: number;
  onSelect(value: string): void;
}

const AutoComplete = (props: IAutoCompleteProps) => {
  const dropDownReference = useRef<HTMLDivElement>(null);
  const { index, dataSource, onSelect } = props;

  const onItemSelect = (event, itemIndex) => {
    onSelect(dataSource[itemIndex]);
  };

  function renderMenuItems() {
    return dataSource.slice(0, 10).map((item, itemIndex) => {
      const isActive = itemIndex === index;
      return (
        <div
          className={
            isActive
              ? 'ant-select-item ant-select-item-option ant-select-item-option-active'
              : 'ant-select-item ant-select-item-option'
          }
          style={{
            padding: '5px 12px',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            backgroundColor: isActive ? '#f5f5f5' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={(event) => onItemSelect(event, itemIndex)}
          key={item.name}
        >
          {item.label ? `${item.name} (${item.label})` : `${item.name}`}
        </div>
      );
    });
  }

  if (dataSource.length === 0) return null;

  return (
    <div
      ref={dropDownReference}
      className='ant-select-dropdown ant-select-dropdown-placement-bottomLeft'
      style={{
        position: 'absolute',
        left: props.leftPosition,
        top: props.topPosition,
        zIndex: 1050,
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow:
          '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
        padding: '4px 0',
        maxHeight: '256px',
        overflow: 'auto',
      }}
    >
      <div className='rc-virtual-list'>
        <div className='rc-virtual-list-holder'>
          <div className='rc-virtual-list-holder-inner'>{renderMenuItems()}</div>
        </div>
      </div>
    </div>
  );
};

export default AutoComplete;
