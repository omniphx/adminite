import { hasMatch } from "./utils"

describe('utils', () => {
  it('should match', () => {
    const record = {
      Name: 'Marty',
      Id: '0061N00000TbONRQA3',
      attributes: { type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONRQA3' },
      editFields: [],
      errorMessage: '',
      key: '0061N00000TbONRQA3'
    }

    expect(hasMatch(record, 'Marty')).toBe(true)
  })

  it('should not match', () => {
    const record = {
      CloseDate: 'Rick Sanchez',
      Id: '0061N00000TbONRQA3',
      attributes: { type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONRQA3' },
      editFields: [],
      errorMessage: '',
      key: '0061N00000TbONRQA3'
    }

    expect(hasMatch(record, 'Morty Smith')).toBe(false)
  })

  it('should match regardless of date format', () => {
    const record = {
      CloseDate: '2019-11-14',
      Id: '0061N00000TbONRQA3',
      attributes: { type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONRQA3' },
      editFields: [],
      errorMessage: '',
      key: '0061N00000TbONRQA3'
    }

    expect(hasMatch(record, '11/14/2019')).toBe(true)
  })

  it('should not match regardless of date format', () => {
    const record = {
      CloseDate: '2019-11-14',
      Id: '0061N00000TbONRQA3',
      attributes: { type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONRQA3' },
      editFields: [],
      errorMessage: '',
      key: '0061N00000TbONRQA3'
    }

    expect(hasMatch(record, '11/15/2019')).toBe(false)
  })
})