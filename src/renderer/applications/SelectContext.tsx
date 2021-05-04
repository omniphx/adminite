import * as React from 'react'
import { Select } from 'antd'

interface ISelectContextProps {
  sobjects: any
  sobject: any
  loading?: boolean
  handleChange(event: any): void
}

const SelectContext: React.FC<ISelectContextProps> = React.memo((props: ISelectContextProps) => {
  const [options, setOptions] = React.useState([])

  React.useEffect(() => {
    setOptions(props.sobjects)
  }, [props.sobjects])

  const fetchOptions = (searchValue: string) => {
    setOptions(props.sobjects
      .filter(option => {
        const apiMatch = option.name.toLowerCase().startsWith(searchValue.toLowerCase())
        const labelMatch = option.label.toLowerCase().startsWith(searchValue.toLowerCase())
        return apiMatch || labelMatch
      })
    )
  }

  return (
    <Select
      showSearch
      style={{ width: '100%' }}
      value={props.sobject ? props.sobject : 'Search for an SObject'}
      onChange={props.handleChange}
      onSearch={fetchOptions}
      loading={props.loading}
    >
      {options.slice(0,25).map(option => (
        <Select.Option key={option.name} value={option.name}>
          {option.name} ({option.label})
        </Select.Option>
      ))}
    </Select>
  )
})

export default SelectContext
