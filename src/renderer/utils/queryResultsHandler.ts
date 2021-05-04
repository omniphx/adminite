export function flattenData(record) {
  let newRecord = {...record}
  flatten(record, '')
  function flatten(record, preFix) {
    return Object.keys(record).forEach(key => {
      if (key === 'attributes') return
      if (key === 'key') return
      if (key === 'editFields') return
      if (key === 'errorMessage') return

      //Null is fine, but records are bad... very weird/hacky guard clause
      if (record[key]) {
        if (record[key].records) return
      }

      //Nulls are also objects... fucking JavaScript
      if (record[key] !== null && typeof record[key] === 'object') {
        flatten(record[key], `${preFix}${key}.`)
      } else {
        newRecord[`${preFix}${key}`] = record[key]
      }
    })
  }

  return newRecord
}