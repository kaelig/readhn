"use strict";

require("isomorphic-fetch");
const moment = require("moment");
const URL = require("url").URL;

const NUMBER_OF_STORIES = process.env.NUMBER_OF_STORIES || 25;

const capitalizeFirstLetter = word =>
  word.charAt(0).toUpperCase() + word.slice(1);

// Naïve titlecase, improves scanability
const startCase = sentence =>
  sentence
    .split(" ")
    .map(capitalizeFirstLetter)
    .join(" ");

const fetchStory = id =>
  fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(data =>
    data.json()
  );

const fetchTopStories = numberOfStories =>
  fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
    .then(data => data.json())
    .then(topStories => topStories.slice(0, numberOfStories));

// On Hacker News, some stories are comment threads
// and other stories are external "actual" stories
const isActualStory = story => !!story.url;

const isExcludedFromInstapaper = url =>
  ["https://www.bloomberg.com"].some(domain => url.startsWith(domain));

const buildStoriesObject = ({ id, title, time, url, score, by }) => ({
  id,
  title: startCase(title),
  relativeTime: moment.unix(time).fromNow(),
  time,
  url,
  score,
  by,
  hostname: new URL(url).hostname,
  instapaperUrl: isExcludedFromInstapaper(url)
    ? url
    : `https://www.instapaper.com/text?u=${encodeURIComponent(url)}`
});

const fetchTopStoriesWithLinks = (numberOfStories = NUMBER_OF_STORIES) =>
  fetchTopStories(numberOfStories + 20).then(topStories =>
    Promise.all(topStories.map(fetchStory)).then(bodies =>
      bodies
        .filter(isActualStory)
        .slice(0, numberOfStories)
        .map(buildStoriesObject)
    )
  );

module.exports = {
  NUMBER_OF_STORIES,
  fetchTopStoriesWithLinks
};
