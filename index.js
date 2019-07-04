const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const bodyParser = require('body-parser')
const { join } = require('path')
const mongoose = require('mongoose')
const authConfig = require('./client/src/auth_config.json')
require('dotenv').config()

const Schema = new mongoose.Schema({
  uid         : String,
  authorName  : String,
  text        : String
}, {
  collation: { locale: 'en_US' },
  timestamps: true,
})
Schema.index({ authorName: 1, text: 1 })
const Quote = mongoose.model('Quote', Schema)

const app = express()
app.use(morgan('dev'))
app.use(helmet())
app.use(bodyParser.json())
app.use(express.static(join(__dirname, 'client', 'build')))

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256']
})

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

app.get('/api/quotes/:id', checkJwt, asyncHandler(async (req, res, next) => {
  const query = { _id: req.params.id, uid: req.user.sub }
  const quote = await Quote.findOne(query).exec()
  res.status(200).json(quote)
}))

app.get('/api/quotes', checkJwt, asyncHandler(async (req, res, next) => {
  const query = { uid: req.user.sub }
  if (req.query.authorName) query.authorName = new RegExp(req.query.authorName, 'i')
  if (req.query.text) query.text = new RegExp(req.query.text, 'i')
  const sort = (req.query.sortBy || []).split(',').reduce((o, v) => {
    v.charAt(0) === '-' ? o[v.substr(1)] = -1 : o[v] = 1
    return o
  }, {})
  const page = parseInt(req.query.page) - 1 || 0
  if (page < 0) return res.status(400).json({ error: 'Page must be > 0' })
  const limit = parseInt(req.query.pageSize) || 10
  const quotes = await Quote.find(query, null, { skip: page * limit, limit: limit, sort: sort }).exec()
  const count = await Quote.countDocuments(query).exec()
  res.status(200).json({
    results: quotes,
    pagination: {
      page: page + 1,
      pageCount: Math.ceil(count / limit),
      pageSize: limit,
      rowCount: count
    }
  })
}))

app.post('/api/quotes', checkJwt, asyncHandler(async (req, res, next) => {
  const quote = new Quote(req.body)
  quote.uid = req.user.sub
  await quote.save()
  res.status(201).json(quote)
}))

app.put('/api/quotes/:id', checkJwt, asyncHandler(async (req, res, next) => {
  const quote = await Quote.findOne({ _id: req.params.id, uid: req.user.sub }).exec()
  if (!quote) return res.status(404).json({ error: 'Quote not found' })
  quote.authorName = req.body.authorName
  quote.text = req.body.text
  await quote.save()
  res.status(200).json(quote)
}))

app.delete('/api/quotes/:id', checkJwt, asyncHandler(async (req, res, next) => {
  await Quote.deleteOne({ _id: req.params.id, uid: req.user.sub })
  res.sendStatus(200)
}))

app.use((_, res) => {
  res.sendFile(join(__dirname, 'client', 'build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  return res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal Server Error' })
})

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true
}, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  app.listen(process.env.PORT || 3001)
  console.log('Server started')
})
