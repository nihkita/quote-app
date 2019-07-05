import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth0 } from '../react-auth0-spa'
import { Form, Button, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import Loading from '../components/Loading'

const MyQuotesEdit = props => {
  const { getTokenSilently } = useAuth0()
  const qid = props.match.params.id
  const [loading, setLoading] = React.useState(!!qid)
  const [quote, setQuote] = React.useState({
    authorName: '',
    text: ''
  })

  React.useEffect(() => {
    if (!qid) return
    const fetchQuote = async () => {
      const token = await getTokenSilently()
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const quote = (await axios(`/api/quotes/${qid}`, config)).data
      if (!quote) return props.history.push('/my-quotes')
      setQuote(quote)
      setLoading(false)
    }
    fetchQuote()
  }, [qid, getTokenSilently, props.history])

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

  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target
    form.classList.add('was-validated')
    if (!form.checkValidity()) return
    qid ? await updateQuote() : await addQuote()
    props.history.push('/my-quotes')
  }

  if (loading) return <Loading/>

  return (
    <React.Fragment>
      <h1>{qid ? 'Edit' : 'Add'} Quote</h1>
      <Form className="needs-validation" noValidate onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="authorName">Author Name</Label>
          <Input type="text" id="authorName" name="authorName" value={quote.authorName} onChange={handleInputChange} required />
          <FormFeedback>Please provide an author.</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="text">Text</Label>
          <Input type="textarea" id="text" name="text" value={quote.text} onChange={handleInputChange} required />
          <FormFeedback>Please provide quote text.</FormFeedback>
        </FormGroup>
        <div className="d-flex justify-content-end">
          <Link className="btn btn-secondary" to="/my-quotes">Cancel</Link>
          <Button type="submit" color="primary" className="ml-2">Submit</Button>
        </div>
      </Form>
    </React.Fragment>
  )
}

export default MyQuotesEdit
