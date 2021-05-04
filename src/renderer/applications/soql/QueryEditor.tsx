import * as React from 'react'
import { ApplicationState } from '../../store/index'
import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field } from 'jsforce'
import { Caret, CaretLocator } from '../../utils/caretPosition'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import AutoComplete from './Autocomplete'
import { useSelector, useDispatch } from 'react-redux'
import { onQueryChange } from '../../store/queries/actions'
import { onQuerySObjectChange } from '../../store/sobject/actions'
import { SoqlQuery } from '../../store/queries/types'
import { SchemaState } from '../../store/schema/types'
import { Input } from 'antd'

interface IQueryEditorProps {
  tabId: string
}

const QueryEditor: React.FC<IQueryEditorProps> = (props: IQueryEditorProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  //Global State
  const toolingMode: boolean = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].toolingMode)
  const schemaState: SchemaState = useSelector((state: ApplicationState) => state.schemaState)
  const fields: any = getFields(useSelector((state: ApplicationState) => state.querySobjectsState.byTabId[tabId].sobject))
  const query: SoqlQuery = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].query)
  const activeId: string = useSelector((state: ApplicationState) => state.queryTabsState.activeId)
  const disableAutoComplete: boolean = useSelector((state: ApplicationState) => state.userState.disableAutoComplete)
  const disableInlineTabs: boolean = useSelector((state: ApplicationState) => state.userState.disableInlineTabs)

  const sobjects: any[] = getQueryableSObjects(toolingMode ? schemaState.toolingObjects : schemaState.sobjects)

  const keywords = [
    { name: 'AND', type: 'keyword' },
    { name: 'ASC', type: 'keyword' },
    { name: 'DESC', type: 'keyword' },
    { name: 'EXCLUDES', type: 'keyword' },
    { name: 'FIRST', type: 'keyword' },
    { name: 'FROM', type: 'keyword' },
    { name: 'GROUP BY', type: 'keyword' },
    { name: 'HAVING', type: 'keyword' },
    { name: 'IN', type: 'keyword' },
    { name: 'INCLUDES', type: 'keyword' },
    { name: 'LAST', type: 'keyword' },
    { name: 'LIKE', type: 'keyword' },
    { name: 'LIMIT', type: 'keyword' },
    { name: 'NOT', type: 'keyword' },
    { name: 'OR', type: 'keyword' },
    { name: 'ORDER BY', type: 'keyword' },
    { name: 'SELECT', type: 'keyword' },
    { name: 'WHERE', type: 'keyword' },
    { name: 'WITH', type: 'keyword' }
  ]

  const sObjectPattern = /(?:from\s)(\w*)$/i
  const fieldPattern = /(['\w]+)$/i
  const omitParentLookupPattern = /\.\w*$/i

  const [dataSource, setDataSource] = React.useState([])
  const [leftPosition, setLeftPosition] = React.useState(0)
  const [topPosition, setTopPosition] = React.useState(0)
  const [sobject, setSObject] = React.useState('')
  const [startIndex, setStartIndex] = React.useState(0)
  const [caret, setCaret] = React.useState<Caret>(undefined)
  const [typeaheadIndex, setTypeaheadIndex] = React.useState<number>(0)

  const textAreaReference: any = React.useRef(null)
  const divRef: any = React.useRef(null)

  React.useEffect(() => {
    setCaret(new Caret(document.querySelector('#queryTextArea')))
    return () => {
      setCaret(null)
    }
  }, [])

  React.useEffect(() => {
    if(tabId === activeId && textAreaReference) {
      textAreaReference.current.focus()
    }
  }, [activeId])

  const handleChange = (event: any) => {
    dispatch(onQueryChange({ tabId, query: { ...query, body:event.target.value }}))
    setMatches(event.target)
  }

  const setMatches = (target: HTMLTextAreaElement) => {
    if(disableAutoComplete) return
    const beginning = target.value.substring(0, target.selectionEnd)
    const regex = new RegExp(/\b(\w+)$/)
    const matches = beginning.split(regex)
    const beforeWordAtCursor = matches[0]
    const tokenAtCursor = matches[1]
    const wordPosition = beforeWordAtCursor.length
    const tokenMatches = getTokenMatches(tokenAtCursor, beginning)
    const locator: CaretLocator = caret.getCoordinates(wordPosition)

    setDataSource(tokenMatches)
    setLeftPosition(locator.left)
    setTopPosition(locator.top + locator.height)
    setStartIndex(wordPosition)
  }

  const getTokenMatches = (token: string, beginning: string) => {
    let tokenMatches = []
    if (!token) return tokenMatches
    const tokenNormalized = token.toLowerCase()

    if (omitParentLookupPattern.test(beginning)) return tokenMatches
    if (sObjectPattern.test(beginning)) {
      tokenMatches.push(...sobjectMatches(tokenNormalized))
    } else if (fieldPattern.test(beginning)) {
      tokenMatches.push(...fieldMatches(tokenNormalized))
      tokenMatches.push(...keywordMatches(tokenNormalized))
    }

    return tokenMatches
  }

  const keywordMatches = (token: string) => {
    return keywords.filter(keyword => {
      const keywordNormalized = keyword.name.toLowerCase()

      return keywordNormalized.startsWith(token)
    })
  }

  const sobjectMatches = (token: string) => {
    return sobjects.filter((sobject: any) => {
      const name = sobject.name.toLowerCase()
      const label = sobject.label.toLowerCase()

      return name.startsWith(token) || label.startsWith(token)
    })
  }

  const fieldMatches = (token: string) => {
    return fields.filter((field: Field) => {
      const name = field.name.toLowerCase()
      const label = field.label.toLowerCase()

      return name.startsWith(token) || label.startsWith(token)
    })
  }

  const onItemSelect = value => {
    const queryString = query.body
    const queryAfterWordStart = queryString.slice(startIndex)

    //Find first word
    const pattern = new RegExp(/^\b(\w+)/)
    const matches = queryAfterWordStart.split(pattern)

    const beforeMatch = queryString.slice(0, startIndex)
    const afterMatch = matches[2]
    const newQuery = beforeMatch + value.name + afterMatch
    dispatch(onQueryChange({ tabId, query: { ...query, body:newQuery }}))
    caret.setPosition(beforeMatch.length + value.name.length)

    setDataSource([])
    setSObject(value.type === 'sobject' ? value.name : '')

    if (value.type === 'sobject') {
      dispatch(onQuerySObjectChange(tabId, value.name))
    }
  }

  const onKeyPress = (key, event) => {
    switch (key) {
      case 'up':
        if (!dataSource) return
        setTypeaheadIndex(typeaheadIndex <= 0 ? 0 : typeaheadIndex - 1)
        break
      case 'down':
        if (!dataSource) return
        setTypeaheadIndex(typeaheadIndex >= dataSource.length - 1
          ? dataSource.length - 1
          : typeaheadIndex + 1)
        break
      case 'enter':
        if (!dataSource || dataSource.length === 0) return
        event.preventDefault()
        onItemSelect(dataSource[typeaheadIndex])
        break
      case 'esc':
        setDataSource([])
        break
      case 'tab':
        if(disableInlineTabs) return
        handleTab()
        break
      case 'shift+tab':
        if(disableInlineTabs) return
        handleShiftTab()
        break
    }
  }

  return (
    <div className='QueryEditor'>
      <KeyboardEventHandler
        handleKeys={['down', 'up', 'enter', 'esc', 'tab', 'shift+tab']}
        onKeyEvent={onKeyPress}
      >
        <Input.TextArea
          ref={textAreaReference}
          id='queryTextArea'
          style={{ height: 200, tabSize: 2 }}
          className='query-editor_text-area'
          value={query.body}
          onChange={handleChange}
          onKeyDown={(event: React.KeyboardEvent) => {
            if(disableInlineTabs) return
            if(event.keyCode === 9) event.preventDefault()
          }}
        />
        <AutoComplete
          dataSource={dataSource}
          onSelect={onItemSelect}
          topPosition={topPosition}
          leftPosition={leftPosition}
          index={typeaheadIndex}
        />
        <div ref={divRef}/>
      </KeyboardEventHandler>
    </div>
  )

  function handleTab() {
    const { selectionStart, selectionEnd } = textAreaReference.current
    const beginning = query.body.substring(0, selectionStart)
    const end = query.body.substring(selectionEnd, query.body.length)
    if(selectionStart === selectionEnd) {
      const newQuery = `${beginning}\t${end}`
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery }}))
      caret.setPosition(selectionStart + 1)
    } else {
      const queryLines = query.body.split('\n')
      let start = 0
      let end = 0
      let tabsAdded = 0
      let tabsAddedBeforeStart = 0
      const newQueryLines = queryLines.map((queryLine, index) => {
        end += queryLine.length
        // console.log(`Start > selectionEnd: ${start} > ${selectionEnd - index} = ${start > selectionEnd - index}`)
        // console.log(`End < selectionStart: ${end} < ${selectionStart  - index} = ${end < selectionStart  - index}`)
        //Subtracting by index because we have removed the tab character
        const lineStartAfterSelection = start > selectionEnd - index
        const lineEndBeforeSelection = end < selectionStart - index
        const lineStartBeforeSelection = start < selectionStart - index
        start += queryLine.length

        if(lineStartAfterSelection || lineEndBeforeSelection) {
          return queryLine
        } else {
          if(lineStartBeforeSelection) tabsAddedBeforeStart++
          tabsAdded++
          return `\t${queryLine}`
        }
      })
      const newQuery = newQueryLines.join('\n')
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery }}))
      caret.setPosition(selectionStart + tabsAddedBeforeStart, selectionEnd + tabsAdded)
    }
  }

  function handleShiftTab() {
    const { selectionStart, selectionEnd } = textAreaReference.current
    if(selectionStart !== selectionEnd) {
      const queryLines = query.body.split('\n')
      let tabsRemoved = 0
      let tabsRemovedBeforeSelection = 0
      let start = 0
      let end = 0

      const newQueryLines = queryLines.map((queryLine, index) => {
        end += queryLine.length
        // console.log(`Start <= selectionEnd: ${start} > ${selectionEnd} = ${start > selectionEnd}`)
        // console.log(`End < selectionStart: ${end} < ${selectionStart} = ${end < selectionStart}`)
        const lineStartAfterSelection = start > selectionEnd - index
        const lineEndBeforeSelection = end < selectionStart - index
        const lineStartBeforeSelection = start < selectionStart - index
        const lineStartsWithTab = queryLine.startsWith('\t')
        start += queryLine.length

        if(lineStartAfterSelection || lineEndBeforeSelection || !lineStartsWithTab) {
          return queryLine
        } else {
          if(lineStartBeforeSelection) tabsRemovedBeforeSelection++
          tabsRemoved++
          return queryLine.replace('\t', '')
        }
      })
      const newQuery = newQueryLines.join('\n')
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery }}))
      caret.setPosition(selectionStart - tabsRemovedBeforeSelection, selectionEnd - tabsRemoved)
    }
  }

  function getQueryableSObjects(sobjects: DescribeGlobalSObjectResult[]) {
    return sobjects
      .filter(sobject => {
        return sobject.queryable
      })
      .map(sobject => {
        return {
          ...sobject,
          type: 'sobject'
        }
      })
  }
  
  function getFields(sobject: DescribeSObjectResult) {
    if (!sobject) return []
    return sobject.fields.map(field => {
      return {
        ...field,
        type: 'field'
      }
    })
  }
}

export default QueryEditor
