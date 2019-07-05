import React from 'react'
import isEqual from 'lodash.isequal'

export const usePrevious = val => {
  const ref = React.useRef(val)
  React.useEffect(() => { ref.current = val })
  return ref.current
}

export const useCompare = val => {
  const prevVal = usePrevious(val)
  return !isEqual(prevVal, val)
}
