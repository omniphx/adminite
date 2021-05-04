import { flattenData } from "./queryResultsHandler"

describe('queryResultsHandler', () => {

  it('should render', () => {
    const record = {
      attributes: {},
      key: 'test',
      editFields: [],
      errorMessage: 'fake news',
      Account: {
        Name: 'Morty',
        ParentAccount: {
          Name: 'Jerry'
        }
      }
    }

    const result = flattenData(record)
    expect(result['Account.Name']).toBe('Morty')
    expect(result['Account.ParentAccount.Name']).toBe('Jerry')
  })
})