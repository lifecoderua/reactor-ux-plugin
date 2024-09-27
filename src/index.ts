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

// Function to handle keypress events
function handleKeyPress(event: KeyboardEvent) {
  // TODO: ignore if modified (Ctrl/Cmd/Alt/Opt), we don't want to react on Ctrl+s / Ctrl+c
  console.log(`Key pressed: ${event.key}`);
}

// Add event listener for keypress events
document.addEventListener('keypress', handleKeyPress);