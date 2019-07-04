import React from 'react'
import axios from 'axios'
import QuoteList from '../components/QuoteList'
import config from '../config.json'

const PublicQuotes = () => {
  const quoteListConfig = {
    requestCb: async query => {
      return (await axios(`${config.publicQuotesUrl}?${query}`)).data
    }
  }
  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-4">
        <h1>Public Quotes</h1>
      </div>
      <QuoteList config={quoteListConfig}/>
    </React.Fragment>
  )
}

export default PublicQuotes
