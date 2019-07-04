import React from 'react'
import QuoteList from '../components/QuoteList'
import axios from 'axios'

const PublicQuotes = () => {
  const config = {
    requestCb: async query => (await axios(`https://auth0-exercise-quotes-api.herokuapp.com/api/quotes?${query}`)).data
  }
  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-4">
        <h1>Public Quotes</h1>
      </div>
      <QuoteList config={config}/>
    </React.Fragment>
  )
}

export default PublicQuotes
