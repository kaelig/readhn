# [www.read.hn](https://www.read.hn) [![CircleCI](https://circleci.com/gh/kaelig/readhn.svg?style=shield)](https://circleci.com/gh/kaelig/readhn) [![Greenkeeper badge](https://badges.greenkeeper.io/kaelig/readhn.svg)](https://greenkeeper.io/)

A simple, fast, and accessible Hacker News top stories reader.

- Shows the top 25 links from Hacker News
- Opens stories in [Instapaper](https://www.instapaper.com/) (free and great for reading stories on both mobile and desktop)
- Supports keyboard navigation
- Shows clearly which stories you've already read
- Accessible to screen readers and people with low-vision
- Gets refreshed every ~5 minutes
- Runs over HTTPS

[![Screenshot of read.hn](https://cloud.githubusercontent.com/assets/85783/24538324/47eb078e-159d-11e7-970a-906cd742a939.png)](https://www.read.hn)

---

## Why do stories open in Instapaper?

Stories open in Instapaper and look something like this:

[![A Great Story in Instapaper](https://cloud.githubusercontent.com/assets/85783/24538317/3d9b3b82-159d-11e7-914b-31e370a0af6b.png)](https://www.instapaper.com/text?u=https%3A%2F%2Fwww.nytimes.com%2F2017%2F03%2F29%2Fbusiness%2Fwestinghouse-toshiba-nuclear-bankruptcy.html)

### Why use Instapaper?

1. It’s free – [Create an account](https://www.instapaper.com).
1. It comes with a great reading experience: large text (useful when reading while walking), good typography settings, night mode…
1. It provides a cross-device “Read Later” functionality (very useful when an article is interesting but will require your full attention later).
1. A lot of stories posted on Hacker News aren’t optimized for mobile, are slow, and come with a lot of ads. Instpaper strips that out and only keeps the content. It’s faster, works on mobile, and is less tiring since all articles look the same.
1. Browsing read.hn & Instapaper feels like a unified experience when your Instapaper settings look like this:

![Instapaper Settings](https://cloud.githubusercontent.com/assets/85783/24484000/b6bfba62-14b0-11e7-8865-afcf40aa44c5.png)

Note: you can still access the original stories by clicking the domain name below each story title.

---

## Keyboard navigation

- <kbd>↓</kbd> <kbd>↑</kbd> next / previous story
- <kbd>⏎</kbd> read story on Instapaper (more accessible and readable than most sites)
- <kbd>alt</kbd> + <kbd>⏎</kbd> read story on original site
- <kbd>c</kbd> open the comments

---

## Contributing

### Discuss changes in an issue

If you’d like to suggest a change or adding a feature, it is recommended to open a GitHub issue and discuss it beforehand.

### Run the project locally

1. Create a fork of this repository
1. Clone the repository on your machine
1. `cd` into the directory
1. run `yarn install`
1. run `yarn run dev`

### Make changes, open a pull request

Commit your changes in a clear an concise manner, then push your changes and open a pull request.

---

## Deploy to Heroku

Deploy your own Hacker News reader for free to [Heroku](https://www.heroku.com) in only 2 clicks.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
