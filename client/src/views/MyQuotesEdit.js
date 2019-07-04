import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth0 } from '../react-auth0-spa'

const MyQuotesEdit = props => {
  const { getTokenSilently } = useAuth0()
  const qid = props.match.params.id
  const [quote, setQuote] = React.useState({
    authorName: '',
    text: ''
  })

  React.useEffect(() => {
    if (!qid) return
    const fetchQuote = async () => setQuote(await getQuote(qid))
    fetchQuote()
  }, [qid])

  const handleInputChange = e => {
    const { name, value } = e.target
    setQuote(q => ({ ...q, [name]: value }))
  }

  const updateQuote = async () => {
    const token = await getTokenSilently()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.put(`/api/quotes/${quote._id}`, quote, config)
  }

  const addQuote = async () => {
    const token = await getTokenSilently()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.post('/api/quotes', quote, config)
  }

  const getQuote = async id => {
    const token = await getTokenSilently()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    return (await axios(`/api/quotes/${id}`, config)).data
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target
    form.classList.add('was-validated')
    if (!form.checkValidity()) return
    qid ? await updateQuote() : await addQuote()
    props.history.push('/my-quotes')
  }

  return (
    <React.Fragment>
      <h1>{qid ? 'Edit' : 'Add'} Quote</h1>
      <form className="needs-validation" noValidate onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="authorName">Author Name</label>
          <input type="text" className="form-control" id="authorName" name="authorName" value={quote.authorName} onChange={handleInputChange} required />
          <div className="invalid-feedback">
            Please provide an author.
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="text">Text</label>
          <textarea className="form-control" id="text" name="text" value={quote.text} onChange={handleInputChange} required></textarea>
          <div className="invalid-feedback">
            Please provide quote text.
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <Link className="btn btn-secondary" to="/my-quotes">Cancel</Link>
          <button type="submit" className="btn btn-primary ml-2">Submit</button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default MyQuotesEdit
