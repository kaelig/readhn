'use strict'

const fetch = require('node-fetch')
const express = require('express')
const URL = require('url-parse')
const moment = require('moment')
const log = require('debug')('readhn')
const morgan = require('morgan')
const memjs = require("memjs").Client

// Set up caches
const STATIC_MAX_AGE = 3600 * 24 * 365
const CACHE_TIME = 300; // seconds
const mjs = memjs.create();

const capitalizeFirstLetter = word =>
  word.charAt(0).toUpperCase() + word.slice(1)
// Naïve titlecase, improves scanability
const startCase = sentence =>
  sentence.split(' ').map(capitalizeFirstLetter).join(' ')

const pug = require('pug')
const app = express()

// Request logging
app.use(morgan('dev'));


const port = process.env.PORT || 3000
const NUMBER_OF_STORIES = 25

app.set('view engine', 'pug')
app.use(express.static('public', { maxAge: STATIC_MAX_AGE }))

const getStory = (id) =>
  fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    .then(data => data.json())

const getStories = (numberOfStories = 50) =>
  fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(data => data.json())
    .then(topStories => topStories.slice(0, numberOfStories))

const isLinkedStory = story => !!story.url

const formLinkedStoryObject = ({
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
          .filter(isLinkedStory)
          .slice(0, numberOfStories)
          .map(formLinkedStoryObject)
        )
    )

app.get('/', (req, res) =>
  mjs.get('stories3', (err, cached) => {
    if (cached) {
      log(`Loading cached stories: ${cached.toString()}`)
      res.render('index', { stories: JSON.parse(cached) })
    } else {
      getTopStoriesWithLinks()
      .then(stories => {
        log(`Caching stories: ${stories}`)
        mjs.set('stories3', JSON.stringify(stories), (err) => {
          if (err) {
            log(err)
            res.render('error', { reason: err.message })
          }
        }, CACHE_TIME)
        res.render('index', { stories })
      })
      .catch(reason => {
        log(reason)
        res.render('error', { reason })
      })
    }
  })
)

app.listen(port, () => {
  console.log('App running on http://localhost:3000')
})
