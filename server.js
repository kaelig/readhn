'use strict'

const fetch = require('node-fetch')
const express = require('express')
const URL = require('url-parse');

const capitalizeFirstLetter = word =>
  word.charAt(0).toUpperCase() + word.slice(1)
// Naïve titlecase, improves scanability
const startCase = sentence =>
  sentence.split(' ').map(capitalizeFirstLetter).join(' ')

const pug = require('pug')
const app = express()

const NUMBER_OF_STORIES = 22

app.set('view engine', 'pug')
app.use(express.static('public'))

const getStory = (id) =>
  fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    .then(data => data.json())
    .catch(reason => console.error(reason))

const getStories = (numberOfStories = 50) =>
  fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(data => data.json())
    .then(topStories => topStories.slice(0, numberOfStories))
    .catch(reason => console.error(reason))

const isLinkedStory = story => !!story.url

const formLinkedStoryObject = ({
  id,
  title,
  time,
  url,
  score
}) =>
  ({
    id,
    title: startCase(title),
    time,
    url,
    score,
    hostname: URL(url).hostname,
    instapaperUrl: `https://www.instapaper.com/text?u=${encodeURIComponent(url)}`
  })

const getTopStoriesWithLinks = (numberOfStories = NUMBER_OF_STORIES) =>
  getStories()
    .then(topStories =>
      Promise.all(topStories.map(
        storyId =>
          getStory(storyId)
      ))
      .then(bodies =>
        bodies
          .filter(isLinkedStory)
          .slice(0, numberOfStories)
          .map(formLinkedStoryObject)
        )
      .catch(reason => console.error(reason))
    )

app.get('/', (req, res) => {
  getTopStoriesWithLinks()
    .then(stories => {
      res.render('index', { stories })
    })
})

app.listen(3000, () => {
  console.log('App running on http://localhost:3000')
})
