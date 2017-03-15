'use strict'

const UP = 38
const DOWN = 40

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
  switch (event.keyCode) {
    case UP:
      event.preventDefault()
      getPreviousStory().querySelector('.story__action').focus()
      break;
    case DOWN:
      event.preventDefault()
      getNextStory().querySelector('.story__action').focus();
      break;
    default:
      break;
  }
}

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
