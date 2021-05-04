import * as React from 'react'
import { DeleteTwoTone } from '@ant-design/icons'
import { Button, Modal, Table, Input } from 'antd'
import { formatQuery, isQueryValid } from 'soql-parser-js'
import { useDispatch, useSelector } from 'react-redux'
import { onQueryChange } from '../../../store/queries/actions'
import { ApplicationState } from '../../../store/index'
import { SoqlQuery } from '../../../store/queries/types'
import { sort } from '../../../../helpers/utils'
import {
  getSoqlQueries,
  deleteSoqlQuery
} from '../../../../helpers/local-store'
const { confirm } = Modal

interface ILoadQueryProps {
  tabId: string
}

const LoadQueries: React.FC<ILoadQueryProps> = (props: ILoadQueryProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const query: SoqlQuery = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].query
  )

  const [showModal, setShowModal] = React.useState(false)
  const [searchFilter, setSearchFilter] = React.useState('')

  const [queries, setQueries] = React.useState([])
  const [queryPreview, setQueryPreview] = React.useState<SoqlQuery>(null)

  React.useEffect(() => {
    setSearchFilter('')
  }, [showModal])

  async function getQueries() {
    const queries = await getSoqlQueries()
    setQueries(queries)
  }

  const onLoadQuery = () => {
    getQueries()
    setShowModal(true)
  }

  const handleSelect = () => {
    dispatch(onQueryChange({ tabId, query: queryPreview }))
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  const onChange = (index: any, selectedRows: any) => {
    if (selectedRows.length < 0) return
    setQueryPreview(selectedRows[0])
  }

  const handleDelete = async queryRecordId => {
    try {
      await deleteSoqlQuery(queryRecordId)
      if (query.id === queryRecordId) {
        //Unset query Id
        dispatch(
          onQueryChange({
            tabId,
            query: { ...query, id: undefined, name: undefined }
          })
        )
      }
      const filterOutQueries = queries.filter(
        query => query.id !== queryRecordId
      )
      setQueries(filterOutQueries)
    } catch (error) {
      console.error(error)
    }
  }

  const showDeleteConfirm = queryRecord => {
    confirm({
      title: `Are you sure you want to delete ${queryRecord.name}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDelete(queryRecord.id)
      }
    })
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase()
        if (nameA < nameB) {
          return -1
        } else if (nameA > nameB) {
          return 1
        } else {
          return 0
        }
      }
    },
    {
      title: 'SObject',
      dataIndex: 'sobject',
      key: 'sobject',
      sorter: (a, b) => {
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase()
        if (nameA < nameB) {
          return -1
        } else if (nameA > nameB) {
          return 1
        } else {
          return 0
        }
      }
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (text, record, index) => {
        return (
          <span>
            <DeleteTwoTone
              style={{ float: 'right', fontSize: '1em' }}
              twoToneColor='#595959'
              onClick={() => showDeleteConfirm(record)}
            />
          </span>
        )
      }
    }
  ]

  return (
    <div style={{ display: 'inline-block' }}>
      <Button type='link' onClick={onLoadQuery}>
        Load Query
      </Button>
      <Modal
        title='Choose Query'
        width='800px'
        onCancel={handleCancel}
        visible={showModal}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={handleSelect}>
            Select
          </Button>
        ]}
      >
        <Input.Search
          placeholder='Filter queries'
          style={{ marginBottom: 7 }}
          value={searchFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFilter(event.currentTarget.value)
          }
        />
        <Table
          columns={columns}
          dataSource={queries
            .filter(item => {
              if (searchFilter.length <= 0) return true
              const nameMatch =
                item.name.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0
              const objectMatch =
                item.sobject
                  .toLowerCase()
                  .indexOf(searchFilter.toLowerCase()) >= 0
              return nameMatch || objectMatch
            })
            .sort((itemA, itemB) => sort(itemA, itemB, 'name'))
            .map(item => {
              return { ...item, key: item.id }
            })}
          rowSelection={{
            type: 'radio',
            onChange
          }}
          pagination={{
            pageSize: 7
          }}
          size='middle'
        />
        <h4>Preview</h4>
        {renderPreview()}
      </Modal>
    </div>
  )

  function renderPreview() {
    return queryPreview ? (
      <code className='code'>
        <pre>
          {isQueryValid(queryPreview.body)
            ? formatQuery(queryPreview.body)
            : queryPreview.body}
        </pre>
      </code>
    ) : (
      <div />
    )
  }
}

export default LoadQueries
