'use strict'

const KEYS = {
  UP: 38,
  DOWN: 40,
  C: 67
}

const $firstStory = document.querySelectorAll('.story')[0]
const $lastStory = [...document.querySelectorAll('.story')].pop()

const getFocusedStory = () => {
  const $action = document.querySelector('.story__action[aria-selected]')
  return $action ? $action.closest('.story') : $lastStory
}

const getPreviousStory = () =>
  (getFocusedStory() === $firstStory) ?
    $lastStory :
    getFocusedStory().previousSibling

const getNextStory = () =>
  (getFocusedStory() === $lastStory) ?
    $firstStory :
    getFocusedStory().nextSibling // next .story

const focusStory = $story => {
  unSelectStory()
  const $action = $story.querySelector('.story__action')
  $action.focus()
  $action.setAttribute('aria-selected', true)
}

const handleKeyboardInteractions = event => {
  // Don't do anything if cmd + arrowkey is pressed
  if (!event.metaKey && !event.ctrlKey) {
    switch (event.keyCode) {
      case KEYS.UP:
        event.preventDefault()
        getPreviousStory().querySelector('.story__action').focus()
        break;
      case KEYS.DOWN:
        event.preventDefault()
        getNextStory().querySelector('.story__action').focus();
        break;
      default:
        break;
    }
  }
}

const handleStoriesKeyboardInteractions = event => {
  if (!event.metaKey && event.keyCode === KEYS.C) {
    event.preventDefault()
    console.log(getFocusedStory())
    return goToComments(getFocusedStory().dataset.storyId)
  }
}

const goToComments = storyId =>
  window.open(`https://news.ycombinator.com/item?id=${storyId}`)

const unSelectStory = () => {
  const $selectedStory = document.querySelector('.story__action[aria-selected]')
  if ($selectedStory) {
    $selectedStory.removeAttribute('aria-selected')
  }
}

const handleOnFocus = event => {
  if (event.target.classList && event.target.classList.contains('story__action')) {
    focusStory(event.target.closest('.story'))
  }
}

const handleOnBlur = event => {
  if (event.target.classList && event.target.classList.contains('story__action')) {
    unSelectStory()
  }
}

// Handle tabbing through links
window.addEventListener('focus', handleOnFocus, true)
window.addEventListener('blur', handleOnBlur, true)

// Handle up-down keys
window.addEventListener('keydown', handleKeyboardInteractions, false)
document.querySelector('.js-top-stories').addEventListener('keydown', handleStoriesKeyboardInteractions, false)
