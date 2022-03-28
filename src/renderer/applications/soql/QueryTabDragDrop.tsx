import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDrag, useDrop } from 'react-dnd-cjs'
import { onQueryTabMove } from '../../store/queryTabs/actions'
import { ApplicationState } from '../../store/index'

interface IQueryTabDragDropProps {
  tabId: string
  children: any
}

const QueryTabDragDrop: React.FC<IQueryTabDragDropProps> = React.memo(
  (props: IQueryTabDragDropProps) => {
    const dispatch = useDispatch()
    const { tabId, children } = props

    const allIds: string[] = useSelector(
      (state: ApplicationState) => state.queryTabsState.allIds
    )

    const index = allIds.indexOf(tabId)
    const tabRef: any = React.useRef()

    const [{ opacity, isDragging }, dragRef] = useDrag({
      item: { type: 'queryTab', index, tabId },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        isDragging: monitor.isDragging()
      })
    })

    const [{ canDrop, isOver, item }, dropRef] = useDrop({
      accept: 'queryTab',
      drop: (item: any) => {
        dispatch(onQueryTabMove(item.tabId, tabId))
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem()
      })
    })

    dragRef(dropRef(tabRef))

    const isActive = canDrop && isOver
    const indexMatch = item && item.index === index
    const indexBelow = item && item.index < index
    const showLeftBorder = isActive && !indexMatch && !indexBelow
    const showRightBorder = isActive && indexBelow

    const childrenWithNewProps = React.Children.map(children, (el, i) => {
      return React.cloneElement(el, {
        style: {
          minWidth: '6em',
          textAlign: 'right',
          opacity,
          borderLeft: showLeftBorder ? '2px solid #1890ff' : '',
          borderRight: showRightBorder ? '2px solid #1890ff' : '',
          cursor: isDragging ? 'grabbing' : ''
        }
      })
    })

    return <span ref={tabRef}>{childrenWithNewProps}</span>
  }
)

export default QueryTabDragDrop
