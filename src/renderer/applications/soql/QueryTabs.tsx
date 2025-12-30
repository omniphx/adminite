import * as React from 'react'

//Components
import { Tabs } from 'antd'
import QueryTab from './QueryTab'
import QueryTabDragDrop from './QueryTabDragDrop'
import { useTabStore } from '../../stores/useTabStore'
import { useQueryResultStore } from '../../stores/useQueryResultStore'

const QueryTabs: React.FC = () => {
  // Zustand store for tabs
  const tabs = useTabStore((state) => state.tabs)
  const tabOrder = useTabStore((state) => state.tabOrder)
  const activeTabId = useTabStore((state) => state.activeTabId)
  const createTab = useTabStore((state) => state.createTab)
  const closeTab = useTabStore((state) => state.closeTab)
  const setActiveTab = useTabStore((state) => state.setActiveTab)

  // Zustand store for query results (Phase 9)
  const createQueryResultTab = useQueryResultStore((state) => state.createTab)
  const deleteQueryResultTab = useQueryResultStore((state) => state.deleteTab)

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
    // Zustand for query results (Phase 9)
    createQueryResultTab(id)
  }

  const remove = (id: string) => {
    // Zustand for query results (Phase 9)
    deleteQueryResultTab(id)
    closeTab(id)
  }

  const tabItems = tabOrder
    .filter(tabId => tabs[tabId])
    .map(tabId => {
      const { title } = tabs[tabId]
      return {
        key: tabId,
        label: title,
        children: <QueryTab tabId={tabId} />
      }
    })

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
        items={tabItems}
      />
    </div>
  )
}

export default QueryTabs
