'use strict'

const KEYS = {
  UP: 38,
  DOWN: 40,
  C: 67
}

const $firstStory = document.querySelectorAll('.js-story')[0]
const $lastStory = [...document.querySelectorAll('.js-story')].pop()

const getSelectedStory = () => {
  const $action = document.querySelector('.js-story__action[aria-selected]')
  return $action ? $action.closest('.js-story') : false
}

const getPreviousStory = () =>
  getSelectedStory() ?
    (getSelectedStory() === $firstStory
      ? $lastStory : getSelectedStory().previousSibling)
    : $lastStory

const getNextStory = () =>
  getSelectedStory() ?
    (getSelectedStory() === $lastStory
      ? $firstStory : getSelectedStory().nextSibling)
    : $firstStory

const selectStory = $story =>
  $story
    .querySelector('.js-story__action')
    .setAttribute('aria-selected', true)

const focusStory = $story => {
  Promise.resolve(unSelectStories())
    .then(() => {
      selectStory($story)
      $story.querySelector('.js-story__action').focus()
    })
}

const handleKeyboardInteractions = event => {
  // Don't do anything if cmd + arrowkey is pressed
  if (!event.metaKey && !event.ctrlKey) {
    switch (event.keyCode) {
      case KEYS.UP:
        event.preventDefault()
        focusStory(getPreviousStory())
        break;
      case KEYS.DOWN:
        event.preventDefault()
        focusStory(getNextStory())
        break;
      default:
        break;
    }
  }
}

const handleStoriesKeyboardInteractions = event => {
  if (!event.metaKey && !event.ctrlKey && event.keyCode === KEYS.C) {
    event.preventDefault()
    return goToComments(getSelectedStory().dataset.storyId)
  }
}

const goToComments = storyId =>
  window.open(`https://news.ycombinator.com/item?id=${storyId}`)

const unSelectStories = () => {
  const $selectedStory = document.querySelector('.js-story__action[aria-selected]')
  if ($selectedStory) {
    $selectedStory.removeAttribute('aria-selected')
  }
}

const eventIsTargettingAction = event =>
  event.target.classList && event.target.classList.contains('story__action')

const eventIsTargettingOtherStoryLinks = event =>
  !!event.target.closest('.js-story')

const handleOnFocus = event => {
  if (eventIsTargettingAction(event)) {
    focusStory(event.target.closest('.js-story'))
  } else if (eventIsTargettingOtherStoryLinks(event)) {
    unSelectStories()
    selectStory(event.target.closest('.js-story'))
  } else {
    unSelectStories()
  }
}

// Handle tabbing through links
document.addEventListener('focus', handleOnFocus, true)

// Handle up-down keys
document.addEventListener('keydown', handleKeyboardInteractions, false)
document.querySelector('.js-top-stories').addEventListener('keydown', handleStoriesKeyboardInteractions, false)
