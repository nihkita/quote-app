import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Container } from 'reactstrap'

import PrivateRoute from './components/PrivateRoute'
import Loading from './components/Loading'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Profile from './views/Profile'
import PublicQuotes from './views/PublicQuotes'
import MyQuotes from './views/MyQuotes'
import MyQuotesEdit from './views/MyQuotesEdit'
import { useAuth0 } from './react-auth0-spa'

import 'samples-bootstrap-theme/dist/css/auth0-theme.css'
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

const App = () => {
  const { loading } = useAuth0()

  if (loading) return <Loading />

  return (
    <div id="app">
      <Router>
        <NavBar />
        <Container className="my-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/public-quotes" exact component={PublicQuotes} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute path="/my-quotes" exact component={MyQuotes} />
            <PrivateRoute path="/my-quotes/add" component={MyQuotesEdit} />
            <PrivateRoute path="/my-quotes/edit/:id" component={MyQuotesEdit} />
          </Switch>
        </Container>
      </Router>
    </div>
  )
}

export default App
