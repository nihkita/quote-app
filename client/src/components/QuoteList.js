import React from 'react'
import debounce from 'lodash.debounce'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  InputGroup,
  InputGroupButtonDropdown
} from 'reactstrap'

const QuoteList = props => {
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
  const [isSortDropdownOpen, setSortDropdownOpen] = React.useState(false)
  const [isSearchDropdownOpen, setSearchDropdownOpen] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [pageCount, setPageCount] = React.useState(1)
  const [searchValue, setSearchValue] = React.useState('')
  const [searchField, setSearchField] = React.useState(searchFields[0])
  const [sortField, setSortField] = React.useState(sortFields[0])

  React.useEffect(() => {
    if (loading) return
    setPage(1)
    setRefresh(!refresh)
  }, [props.refresh, pageSize, searchValue, sortField])

  React.useEffect(() => {
    if (!searchValue) return
    setPage(1)
    setRefresh(!refresh)
  }, [searchField])

  React.useEffect(() => {
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
  }, [refresh])

  const handlePageSizeChange = e => setPageSize(parseInt(e.target.value))
  const handleSearch = debounce(text => setSearchValue(text), 500)
  const handlePrev = () => {
    setPage(page - 1)
    setRefresh(!refresh)
  }
  const handleNext = () => {
    setPage(page + 1)
    setRefresh(!refresh)
  }

  return (
    <React.Fragment>
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
        <div className="form-group">
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
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="5x" className="my-4" />
          <h3>Loading Results...</h3>
        </div>
      ) : (
        <React.Fragment>
          <ul className="list-unstyled">
            {data.map((item, i) =>
              <li key={i} className="d-flex align-items-start">
                <blockquote className="blockquote mr-3 text-truncate">
                  <p className="mb-0 text-truncate">{item.text}</p>
                  <footer className="blockquote-footer">{item.authorName || 'Anonymous'}</footer>
                </blockquote>
                {(props.config.controls || []).map((control, i) => (
                  <button key={i} className={`mx-2 btn ${control.buttonClass || 'btn-secondary'}`} onClick={() => control.cb(item._id)}>
                    <FontAwesomeIcon icon={control.icon} />
                  </button>
                ))}
              </li>
            )}
          </ul>
          <hr/>
          <div className="form-inline">
            <div className="d-flex align-items-center">
              <label htmlFor="pageSize" className="mb-0">Rows</label>
              <select className="form-control ml-3" id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
                <option value="1">1</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex-grow-1"></div>
            <span className="ml-4">Page {page} of {pageCount}</span>
            <button className="btn btn-secondary ml-4" onClick={handlePrev} disabled={page === 1}>Previous</button>
            <button className="btn btn-secondary ml-2" onClick={handleNext} disabled={page === pageCount}>Next</button>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export default QuoteList
