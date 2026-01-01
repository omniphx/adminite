import * as React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTabStore } from '../../stores/useTabStore';

interface IQueryTabDragDropProps {
  tabId: string;
  children: any;
}

const QueryTabDragDrop: React.FC<IQueryTabDragDropProps> = React.memo(
  (props: IQueryTabDragDropProps) => {
    const { tabId, children } = props;

    const tabOrder = useTabStore((state) => state.tabOrder);
    const moveTab = useTabStore((state) => state.moveTab);

    const index = tabOrder.indexOf(tabId);
    const tabRef = React.useRef<HTMLSpanElement>(null);

    const [{ opacity, isDragging }, dragRef] = useDrag(() => ({
      type: 'queryTab',
      item: { index, tabId },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        isDragging: monitor.isDragging(),
      }),
    }));

    const [{ canDrop, isOver, item }, dropRef] = useDrop(() => ({
      accept: 'queryTab',
      drop: (item: any) => {
        moveTab(item.tabId, tabId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem(),
      }),
    }));

    dragRef(dropRef(tabRef));

    const isActive = canDrop && isOver;
    const indexMatch = item && item.index === index;
    const indexBelow = item && item.index < index;
    const showLeftBorder = isActive && !indexMatch && !indexBelow;
    const showRightBorder = isActive && indexBelow;

    const childrenWithNewProps = React.Children.map(children, (el, _i) => {
      return React.cloneElement(el, {
        style: {
          minWidth: '6em',
          textAlign: 'right',
          opacity,
          borderLeft: showLeftBorder ? '2px solid #1890ff' : '',
          borderRight: showRightBorder ? '2px solid #1890ff' : '',
          cursor: isDragging ? 'grabbing' : '',
        },
      });
    });

    return <span ref={tabRef}>{childrenWithNewProps}</span>;
  }
);

export default QueryTabDragDrop;
