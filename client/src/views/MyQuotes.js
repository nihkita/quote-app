import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import QuoteList from '../components/QuoteList'
import { useAuth0 } from '../react-auth0-spa'
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons'

const MyQuotes = props => {
  const { getTokenSilently } = useAuth0()
  const [refresh, setRefresh] = React.useState(false)

  const deleteQuote = async id => {
    const token = await getTokenSilently()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.delete(`/api/quotes/${id}`, config)
  }

  const config = {
    requestCb: async query => {
      const token = await getTokenSilently()
      const config = { headers: { Authorization: `Bearer ${token}` } }
      return (await axios(`/api/quotes?${query}`, config)).data
    },
    controls: [
      {
        buttonClass: 'btn-success',
        icon: faEdit,
        cb: (quoteId: string) => props.history.push(`/my-quotes/edit/${quoteId}`)
      },
      {
        buttonClass: 'btn-danger',
        icon: faTimes,
        cb: async (quoteId: string) => {
          await deleteQuote(quoteId)
          setRefresh(!refresh)
        }
      }
    ]
  }

  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-4">
        <h1>My Quotes</h1>
        <Link className="btn btn-primary ml-auto" to="/my-quotes/add">Add Quote</Link>
      </div>
      <QuoteList config={config} refresh={refresh} />
    </React.Fragment>
  )
}

export default MyQuotes
