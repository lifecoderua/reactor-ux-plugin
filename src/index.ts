console.log('ReactorUX loaded');
document.body.style.border = "5px solid red";

// TODO: support caps
// TODO: support cyrillic / charkey
enum KEY_BINDING {
  CONTENT_PREVIOUS = 'w',
  CONTENT_NEXT = 's',
  POST_PREVIOUS = 'a',
  POST_NEXT = 'd',
  PAGE_NEXT = 'c',
}

let selectedContentEntry = null;

// Function to handle keypress events
function handleKeyPress(event: KeyboardEvent) {
  console.log(`Key pressed: ${event.key}`, event);

  switch (event.key) {
    case KEY_BINDING.CONTENT_PREVIOUS:
      handleContextPrevious();
      break;
    //...
  }
}

function handleContextPrevious() {
  // reset .selectedContentEntry class on selectedContentEntry

  // IF selectedContentEntry SET selectedContentEntry to the next Content Entry
  // ELSE SET selectedContentEntry to the first Content Entry

  // set .selectedContentEntry class on the new selectedContentEntry

  // if the contained image is not fully visible due to overflow - expand post

  // scroll the .selectedContentEntry to the top of the page
}

function handleContextNext() {

}

function handlePostPrevious() {

}

function handlePostNext() {

}

function handlePageNext() {

}

// Add event listener for keypress events
document.addEventListener('keypress', handleKeyPress);