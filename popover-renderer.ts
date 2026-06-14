// DOM Manipulation
document.addEventListener('DOMContentLoaded', () => {
  // Access DOM elements
  const minimizeBtn = document.getElementById('minimize-btn')
  const closeBtn = document.getElementById('close-btn')
  const selectedTextElement = document.getElementById('selected-text')
  const wordsCountElement = document.getElementById('words-count')
  const regenerateBtn = document.getElementById('regenerate-btn')
  const loadingSelectedTextView = `<span class="placeholder col-7 rounded placeholder-md"></span>
            <span class="placeholder col-4 rounded placeholder-md"></span>
            <span class="placeholder col-4 rounded placeholder-md"></span>
            <span class="placeholder col-6 rounded placeholder-md"></span>
            <span class="placeholder col-8 rounded placeholder-md"></span>`

  // Add event listeners
  closeBtn?.addEventListener('click', () => {
    window.electronAPI.closePopover()
  })

  // Add event listeners
  minimizeBtn?.addEventListener('click', () => {
    window.electronAPI.minimizePopover()
  })

  // Add event listeners
  regenerateBtn?.addEventListener('click', () => {
    window.electronAPI.regenerateText()
  })

  // Keep your global functions outside if needed
  function updateSelectedText(selectedText: { message: string, loading: boolean}) {
    const { message, loading } = selectedText
    if (selectedTextElement) {
      if (loading) {
        selectedTextElement.innerHTML = loadingSelectedTextView
      }
      else{
        selectedTextElement.textContent = message
      }
    }
  }

  // Keep your global functions outside if needed
  function updateWordsCount(selectedText: { message: string, loading: boolean}) {
    const count = selectedText.message.split(' ').length.toString();
    if (wordsCountElement) {
      wordsCountElement.textContent = count
    }
  }

  // Listen for the 'selected-text' event from the main process and update the popover content
  window.electronAPI.onSelectedText((selectedText: { message: string, loading: boolean}) => {
    updateSelectedText(selectedText)
    updateWordsCount(selectedText)
  })
})
