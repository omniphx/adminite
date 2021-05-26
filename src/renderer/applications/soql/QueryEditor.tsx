import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import { ApplicationState } from '../../store/index'
import {
  DescribeGlobalSObjectResult,
  DescribeSObjectResult,
  Field
} from 'jsforce'
import { Caret, CaretLocator } from '../../utils/caretPosition'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import AutoComplete from './Autocomplete'
import { useSelector, useDispatch } from 'react-redux'
import { onQueryChange } from '../../store/queries/actions'
import { onQuerySObjectChange } from '../../store/sobject/actions'
import { SoqlQuery } from '../../store/queries/types'
import { SchemaState } from '../../store/schema/types'
import { Input } from 'antd'
import { Connection } from 'jsforce'
import { TextAreaRef } from 'antd/lib/input/TextArea'

interface IQueryEditorProps {
  tabId: string
}

interface IObjectFields {
  [key: string]: Field[]
}

interface IObjectDescriptions {
  [key: string]: DescribeSObjectResult
}

const QueryEditor: React.FC<IQueryEditorProps> = (props: IQueryEditorProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  //Global State
  const toolingMode: boolean = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].toolingMode
  )
  const schemaState: SchemaState = useSelector(
    (state: ApplicationState) => state.schemaState
  )
  const sobject: DescribeSObjectResult = useSelector(
    (state: ApplicationState) => state.querySobjectsState.byTabId[tabId].sobject
  )
  const query: SoqlQuery = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].query
  )
  const activeId: string = useSelector(
    (state: ApplicationState) => state.queryTabsState.activeId
  )
  const disableAutoComplete: boolean = useSelector(
    (state: ApplicationState) => state.userState.disableAutoComplete
  )
  const disableInlineTabs: boolean = useSelector(
    (state: ApplicationState) => state.userState.disableInlineTabs
  )

  const salesforce: Connection = useSelector(
    (state: ApplicationState) => state.connectionState.connection
  )

  const keywords = [
    { name: 'AND', tokenType: 'keyword' },
    { name: 'ASC', tokenType: 'keyword' },
    { name: 'DESC', tokenType: 'keyword' },
    { name: 'EXCLUDES', tokenType: 'keyword' },
    { name: 'FIRST', tokenType: 'keyword' },
    { name: 'FROM', tokenType: 'keyword' },
    { name: 'GROUP BY', tokenType: 'keyword' },
    { name: 'HAVING', tokenType: 'keyword' },
    { name: 'IN', tokenType: 'keyword' },
    { name: 'INCLUDES', tokenType: 'keyword' },
    { name: 'LAST', tokenType: 'keyword' },
    { name: 'LIKE', tokenType: 'keyword' },
    { name: 'LIMIT', tokenType: 'keyword' },
    { name: 'NOT', tokenType: 'keyword' },
    { name: 'OR', tokenType: 'keyword' },
    { name: 'ORDER BY', tokenType: 'keyword' },
    { name: 'SELECT', tokenType: 'keyword' },
    { name: 'WHERE', tokenType: 'keyword' },
    { name: 'WITH', tokenType: 'keyword' }
  ]

  const wordBoundary = /\b([\w\.]+)$/i
  const sObjectPattern = /(?:from\s)(\w*)$/i
  const fieldPattern = /(['\w]+)$/i
  const parentLookupPattern = /\.([\w\.]*)$/i
  const parentWordBoundary = /([\w\.]*)$/i

  const [dataSource, setDataSource] = useState([])
  const [leftPosition, setLeftPosition] = useState(0)
  const [topPosition, setTopPosition] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [caret, setCaret] = useState<Caret>(undefined)
  const [typeaheadIndex, setTypeaheadIndex] = useState<number>(0)
  const [fields, setFields] = useState<Field[]>([])
  const [parentRelationshipToken, setParentRelationshipToken] = useState('')

  const [parentRelationshipFields, setParentRelationshipFields] = useState<
    IObjectFields
  >({})

  const [objectDescriptions, setObjectDescriptions] = useState<
    IObjectDescriptions
  >({})

  const [sobjects, setSobjects] = useState<DescribeGlobalSObjectResult[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const relationships = parentRelationshipToken.split('.')
      if (parentRelationshipToken in parentRelationshipFields) return

      let fields = sobject.fields
      for (let i = 0; i < relationships.length; i++) {
        if ((mounted = false)) return
        const relationship = relationships[i]
        const relationshipField = fields.find(
          field => field.relationshipName === relationship
        )
        if (!relationshipField) return

        const parentRelationship = relationshipField.referenceTo[0]

        let parentSobject: DescribeSObjectResult

        if (parentRelationship in objectDescriptions) {
          parentSobject = objectDescriptions[parentRelationship]
        } else {
          parentSobject = toolingMode
            ? await salesforce.tooling.describe(parentRelationship)
            : await salesforce.describe(parentRelationship)

          if ((mounted = false)) return
          setObjectDescriptions({
            ...objectDescriptions,
            [parentRelationship]: parentSobject
          })
        }

        // If last item, set fields and if not set parent fields
        if (i + 1 === relationships.length) {
          setParentRelationshipFields({
            ...parentRelationshipFields,
            [parentRelationshipToken]: parentSobject.fields
          })
        } else {
          fields = parentSobject.fields
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [parentRelationshipToken, toolingMode, salesforce])

  const textAreaReference = useRef<TextAreaRef>(null)

  useEffect(() => {
    setCaret(new Caret(document.querySelector('#queryTextArea')))
    return () => {
      setCaret(null)
    }
  }, [])

  useEffect(() => {
    if (tabId === activeId && textAreaReference) {
      textAreaReference.current.focus()
    }
  }, [activeId])

  useEffect(() => {
    if (sobject) {
      setFields(sobject.fields)
    }
  }, [sobject])

  useEffect(() => {
    if (schemaState) {
      const sobjects = toolingMode
        ? schemaState.toolingObjects
        : schemaState.sobjects
      const queryableSObjects = sobjects.filter(sobject => sobject.queryable)

      setSobjects(queryableSObjects)
    }
  }, [toolingMode, schemaState])

  const handleChange = (event: any) => {
    dispatch(
      onQueryChange({ tabId, query: { ...query, body: event.target.value } })
    )
    setMatches(event.target)
  }

  const setMatches = (target: HTMLTextAreaElement) => {
    if (disableAutoComplete) return
    const beginning = target.value.substring(0, target.selectionEnd)
    const wordBoundaryRegex = new RegExp(wordBoundary)
    const [beforeWordAtCursor, tokenAtCursor] = beginning.split(
      wordBoundaryRegex
    )

    if (!tokenAtCursor) return
    const indexOfLastPeriod = tokenAtCursor.lastIndexOf('.')
    const cursorDropDown = tokenAtCursor.substring(0, indexOfLastPeriod + 1)

    const wordPosition = beforeWordAtCursor.length + cursorDropDown.length
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
    if (parentLookupPattern.test(beginning)) {
      let [, parentRelationshipMatch] = beginning.split(parentWordBoundary)
      const indexOfLastPeriod = parentRelationshipMatch.lastIndexOf('.')
      const parentRelationship = parentRelationshipMatch.substring(
        0,
        indexOfLastPeriod
      )
      setParentRelationshipToken(parentRelationship)

      const searchToken = parentRelationshipMatch
        .substring(indexOfLastPeriod + 1)
        .toLowerCase()

      tokenMatches.push(
        ...parentRelationshipFieldMatches(parentRelationship, searchToken)
      )
      tokenMatches.push(
        ...parentRelationshipMatches(parentRelationship, searchToken)
      )
    } else if (sObjectPattern.test(beginning)) {
      tokenMatches.push(...sobjectMatches(tokenNormalized))
    } else if (fieldPattern.test(beginning)) {
      tokenMatches.push(...fieldMatches(tokenNormalized))
      tokenMatches.push(...relationshipMatches(tokenNormalized))
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
    return sobjects
      .filter((sobject: any) => {
        const name = sobject.name.toLowerCase()
        const label = sobject.label.toLowerCase()

        return name.startsWith(token) || label.startsWith(token)
      })
      .map(field => {
        return {
          ...field,
          tokenType: 'sobject'
        }
      })
  }

  const fieldMatches = (token: string) => {
    return fields
      .filter((field: Field) => {
        const name = field.name.toLowerCase()
        const label = field.label.toLowerCase()

        return name.startsWith(token) || label.startsWith(token)
      })
      .map(field => {
        return {
          ...field,
          tokenType: 'field'
        }
      })
  }

  const relationshipMatches = (token: string) => {
    return fields
      .filter((field: Field) => {
        if (!field.relationshipName) return false
        const relationshipName = field.relationshipName.toLowerCase()

        return relationshipName.startsWith(token)
      })
      .map(field => {
        return {
          ...field,
          name: field.relationshipName,
          relationship: field.relationshipName,
          tokenType: 'relationship'
        }
      })
  }

  const parentRelationshipFieldMatches = (
    parentRelationship: string,
    token: string
  ) => {
    if (!(parentRelationship in parentRelationshipFields)) return []
    return parentRelationshipFields[parentRelationship]
      .filter((field: Field) => {
        const name = field.name.toLowerCase()
        const label = field.label.toLowerCase()

        return name.startsWith(token) || label.startsWith(token)
      })
      .map(field => {
        return {
          ...field,
          tokenType: 'field'
        }
      })
  }

  const parentRelationshipMatches = (
    parentRelationship: string,
    token: string
  ) => {
    if (!(parentRelationship in parentRelationshipFields)) return []
    return parentRelationshipFields[parentRelationship]
      .filter((field: Field) => {
        if (!field.relationshipName) return false
        const relationshipName = field.name.toLowerCase()

        return relationshipName.startsWith(token)
      })
      .map(field => {
        return {
          ...field,
          name: field.relationshipName,
          relationship: parentRelationship,
          tokenType: 'relationship'
        }
      })
  }

  const onItemSelect = value => {
    debugger
    const queryString = query.body
    const queryAfterWordStart = queryString.slice(startIndex)
    const beforeMatch = queryString.slice(0, startIndex)

    //Find first word
    const pattern = new RegExp(/^\b(\w+)/)
    const matches = queryAfterWordStart.split(pattern)

    // if no first word exists, the pattern will only match with 1 result
    const afterMatch = matches[2] || matches[0]
    const newQuery = beforeMatch + value.name + afterMatch
    dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery } }))
    caret.setPosition(beforeMatch.length + value.name.length)

    setDataSource([])

    if (value.tokenType === 'relationship') {
      setParentRelationshipToken(value.relationship)
    }

    if (value.tokenType === 'sobject') {
      dispatch(onQuerySObjectChange(tabId, value.name))
    }
  }

  const onKeyPress = (key, event) => {
    switch (key) {
      case 'up': {
        if (!dataSource) return
        setTypeaheadIndex(typeaheadIndex <= 0 ? 0 : typeaheadIndex - 1)
        break
      }
      case 'down': {
        if (!dataSource) return
        setTypeaheadIndex(
          typeaheadIndex >= dataSource.length - 1
            ? dataSource.length - 1
            : typeaheadIndex + 1
        )
        break
      }
      case 'enter': {
        if (!dataSource || dataSource.length === 0) return
        event.preventDefault()
        onItemSelect(dataSource[typeaheadIndex])
        break
      }
      case 'esc': {
        setDataSource([])
        break
      }
      case 'tab': {
        if (disableInlineTabs) return
        event.preventDefault()
        handleTab()
        break
      }
      case 'shift+tab': {
        if (disableInlineTabs) return
        event.preventDefault()
        handleShiftTab()
        break
      }
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
            if (disableInlineTabs) return
            if (event.keyCode === 9) event.preventDefault()
          }}
        />
        <AutoComplete
          dataSource={dataSource}
          onSelect={onItemSelect}
          topPosition={topPosition}
          leftPosition={leftPosition}
          index={typeaheadIndex}
        />
      </KeyboardEventHandler>
    </div>
  )

  function handleTab() {
    const {
      selectionStart,
      selectionEnd
    } = textAreaReference.current.resizableTextArea.textArea
    const beginning = query.body.substring(0, selectionStart)
    const end = query.body.substring(selectionEnd, query.body.length)
    if (selectionStart === selectionEnd) {
      const newQuery = `${beginning}\t${end}`
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery } }))
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

        if (lineStartAfterSelection || lineEndBeforeSelection) {
          return queryLine
        } else {
          if (lineStartBeforeSelection) tabsAddedBeforeStart++
          tabsAdded++
          return `\t${queryLine}`
        }
      })
      const newQuery = newQueryLines.join('\n')
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery } }))
      caret.setPosition(
        selectionStart + tabsAddedBeforeStart,
        selectionEnd + tabsAdded
      )
    }
  }

  function handleShiftTab() {
    const {
      selectionStart,
      selectionEnd
    } = textAreaReference.current.resizableTextArea.textArea
    if (selectionStart !== selectionEnd) {
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

        if (
          lineStartAfterSelection ||
          lineEndBeforeSelection ||
          !lineStartsWithTab
        ) {
          return queryLine
        } else {
          if (lineStartBeforeSelection) tabsRemovedBeforeSelection++
          tabsRemoved++
          return queryLine.replace('\t', '')
        }
      })
      const newQuery = newQueryLines.join('\n')
      dispatch(onQueryChange({ tabId, query: { ...query, body: newQuery } }))
      caret.setPosition(
        selectionStart - tabsRemovedBeforeSelection,
        selectionEnd - tabsRemoved
      )
    }
  }
}

export default QueryEditor
