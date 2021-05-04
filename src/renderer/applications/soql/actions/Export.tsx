import * as React from 'react'
import { Input, Button, Modal, Select, Row, Col, Table } from 'antd'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'
import { ipcRenderer, shell } from 'electron'

const { Option } = Select

interface IExportProps {
  tabId: string
}

const Export = React.memo((props: IExportProps) => {
  const { tabId } = props
  const data: string[] = useSelector(
    (state: ApplicationState) => state.queryResultsState.byTabId[tabId].data
  )
  const pending: boolean = useSelector(
    (state: ApplicationState) => state.queryResultsState.byTabId[tabId].pending
  )

  const [showModal, setShowModal] = React.useState(false)
  const [fileName, setFileName] = React.useState<string>('')
  const [fileExtension, setFileExtension] = React.useState('.csv')
  const [formattedData, setFormattedData] = React.useState([])

  React.useEffect(() => {
    ipcRenderer.on('download-complete', handleNewConnection)

    return () => {
      ipcRenderer.removeListener('download-complete', handleNewConnection)
    }
  }, [])

  React.useEffect(() => {
    setFileExtension('.csv')
    setFileName('')
  }, [showModal])

  React.useEffect(() => {
    setFormattedData(formatData(Object.values(data)))
  }, [data])

  function handleNewConnection(event, downloadPath: any) {
    shell.showItemInFolder(downloadPath)
  }

  const handleFileNameChange = (event: any) => {
    setFileName(event.target.value)
  }

  const handleExtensionChange = (value: any) => {
    setFileExtension(value)
  }

  const handleExport = async () => {
    let fileType, worksheet, blobData
    switch (fileExtension) {
      case '.csv':
        fileType = 'text/csvcharset=utf-8'
        worksheet = XLSX.utils.json_to_sheet(formattedData)
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        blobData = new Blob([csv], { type: fileType })
        FileSaver.saveAs(blobData, `${fileName}${fileExtension}`)
        break
      case '.xlsx':
        fileType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheetcharset=UTF-8'
        worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = {
          Sheets: { [fileName]: worksheet },
          SheetNames: [fileName]
        }
        const xlsx = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        blobData = new Blob([xlsx], { type: fileType })
        FileSaver.saveAs(blobData, `${fileName}${fileExtension}`)
        break
      case '.txt':
        fileType = 'text/plain;charset=utf-8'
        worksheet = XLSX.utils.json_to_sheet(formattedData)
        const textFile = XLSX.utils.sheet_to_txt(worksheet)
        blobData = new Blob([textFile], { type: fileType })
        FileSaver.saveAs(blobData, `${fileName}${fileExtension}`)
        break
      case '.html':
        fileType = 'text/html;charset=utf-8'
        worksheet = XLSX.utils.json_to_sheet(formattedData)
        const htmlFile = XLSX.utils.sheet_to_html(worksheet)
        blobData = new Blob([htmlFile], { type: fileType })
        FileSaver.saveAs(blobData, `${fileName}${fileExtension}`)
        break
      case '.json':
        fileType = 'application/json;charset=utf-8'
        blobData = new File(
          [JSON.stringify(data)],
          `${fileName}${fileExtension}`,
          { type: fileType }
        )
        FileSaver.saveAs(blobData)
        break
    }

    setShowModal(false)
  }

  const showExportModal = () => {
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  return (
    <div className='button-style'>
      <Button
        type='link'
        onClick={showExportModal}
        disabled={!data || data.length <= 0 || pending}
      >
        Export
      </Button>
      <Modal
        title='Export'
        onCancel={handleClose}
        visible={showModal}
        footer={[
          <Button
            key='export'
            type='primary'
            onClick={handleExport}
            disabled={!fileName || fileName.length <= 0}
          >
            Export
          </Button>,
          <Button key='back' onClick={handleClose}>
            Close
          </Button>
        ]}
      >
        <Row gutter={2}>
          <Col span={20}>
            <Input
              placeholder='File name'
              value={fileName}
              onChange={handleFileNameChange}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              value={fileExtension}
              onChange={handleExtensionChange}
            >
              <Option value='.csv'>csv</Option>
              <Option value='.xlsx'>xlsx</Option>
              <Option value='.html'>html</Option>
              <Option value='.txt'>txt</Option>
              <Option value='.json'>json</Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <code className='code'>{`${fileName}${fileExtension}`}</code>
          </Col>
        </Row>
      </Modal>
    </div>
  )

  function formatData(records) {
    return records.map(record => {
      const row = {}

      //This step helps flatten lookups and child records
      flattenData(record).forEach(pair => {
        row[pair.key] = pair.value
      })

      return row
    })
  }

  function flattenData(record) {
    let lookupKeyValues = []

    for (const key in record) {
      if (key === 'attributes') continue
      if (key === 'key') continue
      if (key === 'editFields') continue
      if (key === 'errorMessage') continue

      if (typeof record[key] === 'object') {
        if (record[key] === null) continue
        if (record[key].records) {
          lookupKeyValues.push({
            key,
            value: flattenChildRecords(record[key].records)
          })
        } else {
          lookupKeyValues.push(
            ...flattenData(record[key]).map(path => {
              return {
                ...path,
                key: `${key} ${path.key}`
              }
            })
          )
        }
      } else {
        lookupKeyValues.push({
          key,
          value: record[key]
        })
      }
    }

    return lookupKeyValues
  }

  function flattenChildRecords(innerData) {
    return innerData
      .map(record => {
        const recordKeyValueStrings = []

        for (const key in record) {
          if (key === 'attributes') continue
          recordKeyValueStrings.push(`${key}:${record[key]}`)
        }

        return `[${recordKeyValueStrings.join(',')}]`
      })
      .join(',')
  }
})

export default Export
