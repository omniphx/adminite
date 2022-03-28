import * as React from 'react'

//Components
import { Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  onQueryTabsChange,
  onQueryTabCreate,
  onQueryTabDelete
} from '../../store/queryTabs/actions'
import { ApplicationState } from '../../store/index'
import QueryTab from './QueryTab'
import { QueryTabsState } from '../../store/queryTabs/types'
import { onQueryCreate, onQueryDelete } from '../../store/queries/actions'
import { hash } from '../../../helpers/utils'
import {
  onQueryResultCreate,
  onQueryResultDelete
} from '../../store/queryResults/actions'
import {
  onQuerySObjectCreate,
  onResultSObjectCreate,
  onQuerySObjectDelete,
  onResultObjectDelete
} from '../../store/sobject/actions'
import QueryTabDragDrop from './QueryTabDragDrop'

const QueryTabs: React.FC = () => {
  const dispatch = useDispatch()
  //Safe to use QueryTabsState becuase I need all properties
  const queryTabs: QueryTabsState = useSelector(
    (state: ApplicationState) => state.queryTabsState
  )
  const { allIds, byId, activeId } = queryTabs

  const onChange = (activeKey: string) => {
    dispatch(onQueryTabsChange({ activeId: activeKey }))
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
    const id = hash()
    dispatch(onQueryResultCreate(id))
    dispatch(onQueryCreate(id))
    dispatch(onQuerySObjectCreate(id))
    dispatch(onResultSObjectCreate(id))
    dispatch(onQueryTabCreate(id))
  }

  const remove = id => {
    dispatch(onQueryResultDelete(id))
    dispatch(onQueryDelete(id))
    dispatch(onQuerySObjectDelete(id))
    dispatch(onResultObjectDelete(id))
    dispatch(onQueryTabDelete(id))
  }

  return (
    <div>
      <Tabs
        onChange={onChange}
        activeKey={activeId}
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
        {allIds.map(tabId => {
          const queryTab = byId[tabId]
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
