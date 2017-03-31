'use strict'

const fetch = require('node-fetch')
const express = require('express')
const compression = require('compression')
const URL = require('url-parse')
const moment = require('moment')
const log = require('debug')('readhn')
const morgan = require('morgan')
const memjs = require("memjs").Client

const PORT = process.env.PORT || 3000
const NUMBER_OF_STORIES = 25

// Set up caches
const STATIC_MAX_AGE = process.env.NODE_ENV === 'production' ? 3600 * 24 * 365 : 0;
const MEMCACHE_AGE = 300; // seconds
let mjs
try {
  // If memcached is available, let's load it
  mjs = memjs.create()
} catch(e) {
  // Otherwise, let's return a stub
  mjs = ({
    get: () => (null, false)
  })
}

const capitalizeFirstLetter = word =>
  word.charAt(0).toUpperCase() + word.slice(1)
// Naïve titlecase, improves scanability
const startCase = sentence =>
  sentence.split(' ').map(capitalizeFirstLetter).join(' ')

const pug = require('pug')
const app = express()

app.use(compression())

// Request logging
app.use(morgan('dev'));

app.locals.MEMCACHE_AGE = MEMCACHE_AGE

// Automatically redirect to https
app.enable('trust proxy')
app.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV !== 'production') {
    // request was via https or handled locally, so do no special handling
    next()
  } else {
    // request was via http, so redirect to https
    res.redirect(`https://${req.headers.host + req.url}`)
  }
})

app.set('view engine', 'pug')
app.use(express.static('public', { maxAge: STATIC_MAX_AGE }))

const getStory = (id) =>
  fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    .then(data => data.json())

const getStories = (numberOfStories = 50) =>
  fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(data => data.json())
    .then(topStories => topStories.slice(0, numberOfStories))

// On Hacker News, some stories are comments
// and other stories are external "actual" stories
const isActualStory = story => !!story.url

const buildStoriesObject = ({
  id,
  title,
  time,
  url,
  score,
  by
}) =>
  ({
    id,
    title: startCase(title),
    relativeTime: moment.unix(time).fromNow(),
    time,
    url,
    score,
    by,
    hostname: URL(url).hostname,
    instapaperUrl: `https://www.instapaper.com/text?u=${encodeURIComponent(url)}`
  })

const getTopStoriesWithLinks = (numberOfStories = NUMBER_OF_STORIES) =>
  getStories()
    .then(topStories =>
      Promise.all(topStories.map(
        storyId => getStory(storyId)
      ))
      .then(bodies =>
        bodies
          .filter(isActualStory)
          .slice(0, numberOfStories)
          .map(buildStoriesObject)
        )
    )

app.get('/', (req, res) =>
  mjs.get('stories', (err, cached) => {
    if (cached) {
      log(`Loading cached stories: ${cached.toString()}`)
      res.render('index', { stories: JSON.parse(cached) })
    } else {
      getTopStoriesWithLinks()
      .then(stories => {
        log(`Caching stories: ${stories}`)
        mjs.set('stories', JSON.stringify(stories), (err) => {
          if (err) {
            log(err)
            res.render('error', { reason: err.message })
          }
        }, MEMCACHE_AGE)
        res.render('index', { stories })
      })
      .catch(reason => {
        log(reason)
        res.render('error', { reason })
      })
    }
  })
)

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`)
})
