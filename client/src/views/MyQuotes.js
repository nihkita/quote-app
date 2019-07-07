import React, { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons'
import QuoteList from '../components/QuoteList'
import { useAuth0 } from '../react-auth0-spa'

const MyQuotes = props => {
  const { getTokenSilently } = useAuth0()
  const [refresh, setRefresh] = useState(false)

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
        buttonColor: 'success',
        icon: faEdit,
        cb: (quoteId: string) => props.history.push(`/my-quotes/edit/${quoteId}`)
      },
      {
        buttonColor: 'danger',
        icon: faTimes,
        cb: async (quoteId: string) => {
          await deleteQuote(quoteId)
          setRefresh(!refresh)
        }
      }
    ]
  }

  return (
    <Fragment>
      <div className="d-flex align-items-center mb-4">
        <h1>My Quotes</h1>
        <Link className="btn btn-primary ml-auto" to="/my-quotes/add">Add Quote</Link>
      </div>
      <QuoteList config={config} refresh={refresh} />
    </Fragment>
  )
}

export default MyQuotes
