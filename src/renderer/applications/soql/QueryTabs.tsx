import * as React from 'react'

//Components
import { Tabs } from 'antd'
import { useDispatch } from 'react-redux'
import QueryTab from './QueryTab'
import {
  onQueryResultCreate,
  onQueryResultDelete
} from '../../store/queryResults/actions'
import QueryTabDragDrop from './QueryTabDragDrop'
import { useTabStore } from '../../stores/useTabStore'

const QueryTabs: React.FC = () => {
  const dispatch = useDispatch()

  // Zustand store for tabs
  const tabs = useTabStore((state) => state.tabs)
  const tabOrder = useTabStore((state) => state.tabOrder)
  const activeTabId = useTabStore((state) => state.activeTabId)
  const createTab = useTabStore((state) => state.createTab)
  const closeTab = useTabStore((state) => state.closeTab)
  const setActiveTab = useTabStore((state) => state.setActiveTab)

  const onChange = (activeKey: string) => {
    setActiveTab(activeKey)
  }

  const onEdit = (targetKey, action) => {
    switch (action) {
      case 'add':
        add()
        break
      case 'remove':
        remove(targetKey)
        break
    }
  }

  const add = () => {
    const id = createTab()
    // Still need to dispatch to Redux for queryResults (until Phase 9)
    // sObject state now managed by Zustand + TanStack Query (Phase 6)
    dispatch(onQueryResultCreate(id))
  }

  const remove = (id: string) => {
    // Still need to dispatch to Redux for queryResults (until Phase 9)
    // sObject state now managed by Zustand + TanStack Query (Phase 6)
    dispatch(onQueryResultDelete(id))
    closeTab(id)
  }

  return (
    <div>
      <Tabs
        onChange={onChange}
        activeKey={activeTabId}
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props}>
            {node => (
              <QueryTabDragDrop key={node.key} tabId={node.key.toString()}>
                {node}
              </QueryTabDragDrop>
            )}
          </DefaultTabBar>
        )}
        type='editable-card'
        onEdit={onEdit}
      >
        {tabOrder.map(tabId => {
          const queryTab = tabs[tabId]
          if (!queryTab) return null
          const { title } = queryTab
          return (
            <Tabs.TabPane tab={title} key={tabId}>
              <QueryTab {...{ tabId, title }} />
            </Tabs.TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}

export default QueryTabs
