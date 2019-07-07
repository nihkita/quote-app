import React, { useEffect, useState, Fragment } from 'react'
import debounce from 'lodash.debounce'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  Input,
  InputGroup,
  InputGroupButtonDropdown,
  Label,
} from 'reactstrap'
import { useCompare } from '../utils/hooks'

const QuoteList = props => {
  const { refresh } = props
  const sortFields = [
    { text: 'Author Asc', value: 'authorName' },
    { text: 'Author Desc', value: '-authorName' },
    { text: 'Text Asc', value: 'text' },
    { text: 'Text Desc', value: '-text' }
  ]
  const searchFields = [
    { text: 'Author', value: 'authorName' },
    { text: 'Text', value: 'text' }
  ]
  const [isSortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [isSearchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [searchField, setSearchField] = useState(searchFields[0])
  const [sortField, setSortField] = useState(sortFields[0])

  const resetPageRequired = useCompare({refresh, pageSize, searchValue, sortField})
  const searchFieldChanged = useCompare({searchField})

  useEffect(() => {
    if (searchFieldChanged) {
      if (!searchValue) return
      setPage(1)
    }
    if (resetPageRequired) setPage(1)
    const fetchData = async () => {
      setLoading(true)
      const searchStr = searchValue ? `${searchField.value}=${searchValue}`: ''
      const sortStr = `sortBy=${sortField.value}`
      const pageStr = `page=${page}&pageSize=${pageSize}`
      const queryParams = [searchStr, sortStr, pageStr].filter(Boolean).join('&')
      const data = await props.config.requestCb(queryParams)
      setData(data.results)
      setPage(data.pagination.page)
      setPageCount(data.pagination.pageCount || 1)
      setLoading(false)
    }
    fetchData()
  }, [searchFieldChanged, resetPageRequired, searchValue, searchField, sortField, page, pageSize, props.config])

  const handlePageSizeChange = e => setPageSize(parseInt(e.target.value))
  const handleSearch = debounce(text => setSearchValue(text), 500)
  const handlePrev = () => setPage(page - 1)
  const handleNext = () => setPage(page + 1)

  return (
    <Fragment>
      <div className="form-row">
        <InputGroup className="col-md-6 mb-3">
          <InputGroupButtonDropdown addonType="prepend" isOpen={isSearchDropdownOpen} toggle={() => setSearchDropdownOpen(!isSearchDropdownOpen)}>
            <DropdownToggle caret>
              {searchField.text}
            </DropdownToggle>
            <DropdownMenu>
            {searchFields.map(f => (
              <DropdownItem key={`search${f.value}`} onClick={() => setSearchField(f)}>{f.text}</DropdownItem>
            ))}
            </DropdownMenu>
          </InputGroupButtonDropdown>
          <Input type="search" placeholder="Search" onChange={e => handleSearch(e.target.value)} />
        </InputGroup>
        <FormGroup>
          <UncontrolledDropdown isOpen={isSortDropdownOpen} toggle={() => setSortDropdownOpen(!isSortDropdownOpen)}>
            <DropdownToggle caret>
              Sort By: {sortField.text}
            </DropdownToggle>
            <DropdownMenu>
            {sortFields.map(f => (
              <DropdownItem key={`sort${f.value}`} onClick={() => setSortField(f)}>{f.text}</DropdownItem>
            ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </FormGroup>
      </div>
      {loading ? (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="5x" className="my-4" />
          <h3>Loading Results...</h3>
        </div>
      ) : (
        <Fragment>
          <ul className="list-unstyled">
            {data.map((item, i) =>
              <li key={i} className="d-flex align-items-start">
                <blockquote className="blockquote mr-3 text-truncate">
                  <p className="mb-0 text-truncate">{item.text}</p>
                  <footer className="blockquote-footer">{item.authorName || 'Anonymous'}</footer>
                </blockquote>
                {(props.config.controls || []).map((control, i) => (
                  <Button key={i} color={control.buttonColor || 'secondary'} className='mx-2' onClick={() => control.cb(item._id)}>
                    <FontAwesomeIcon icon={control.icon} />
                  </Button>
                ))}
              </li>
            )}
          </ul>
          <hr/>
          <div className="form-inline">
            <div className="d-flex align-items-center">
              <Label for="pageSize" className="mb-0">Rows</Label>
              <Input type="select" className="ml-3" id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
                <option>1</option>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </Input>
            </div>
            <div className="flex-grow-1"></div>
            <span className="ml-4">Page {page} of {pageCount}</span>
            <Button className="ml-4" onClick={handlePrev} disabled={page === 1}>Previous</Button>
            <Button className="ml-2" onClick={handleNext} disabled={page === pageCount}>Next</Button>
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}

export default QuoteList
