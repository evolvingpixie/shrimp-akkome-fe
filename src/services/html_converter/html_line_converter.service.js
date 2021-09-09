import { getTagName } from './utility.service.js'

/**
 * This is a tiny purpose-built HTML parser/processor. This basically detects
 * any type of visual newline and converts entire HTML into a array structure.
 *
 * Text nodes are represented as object with single property - text - containing
 * the visual line. Intended usage is to process the array with .map() in which
 * map function returns a string and resulting array can be converted back to html
 * with a .join('').
 *
 * Generally this isn't very useful except for when you really need to either
 * modify visual lines (greentext i.e. simple quoting) or do something with
 * first/last line.
 *
 * known issue: doesn't handle CDATA so nested CDATA might not work well
 *
 * @param {Object} input - input data
 * @return {(string|{ text: string })[]} processed html in form of a list.
 */
export const convertHtmlToLines = (html = '') => {
  // Elements that are implicitly self-closing
  // https://developer.mozilla.org/en-US/docs/Glossary/empty_element
  const emptyElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ])
  // Block-level element (they make a visual line)
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  const blockElements = new Set([
    'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd',
    'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main',
    'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'
  ])
  // br is very weird in a way that it's technically not block-level, it's
  // essentially converted to a \n (or \r\n). There's also wbr but it doesn't
  // guarantee linebreak, only suggest it.
  const linebreakElements = new Set(['br'])

  const visualLineElements = new Set([
    ...blockElements.values(),
    ...linebreakElements.values()
  ])

  // All block-level elements that aren't empty elements, i.e. not <hr>
  const nonEmptyElements = new Set(visualLineElements)
  // Difference
  for (let elem of emptyElements) {
    nonEmptyElements.delete(elem)
  }

  // All elements that we are recognizing
  const allElements = new Set([
    ...nonEmptyElements.values(),
    ...emptyElements.values()
  ])

  let buffer = [] // Current output buffer
  const level = [] // How deep we are in tags and which tags were there
  let textBuffer = '' // Current line content
  let tagBuffer = null // Current tag buffer, if null = we are not currently reading a tag

  const flush = () => { // Processes current line buffer, adds it to output buffer and clears line buffer
    if (textBuffer.trim().length > 0) {
      buffer.push({ level: [...level], text: textBuffer })
    } else {
      buffer.push(textBuffer)
    }
    textBuffer = ''
  }

  const handleBr = (tag) => { // handles single newlines/linebreaks/selfclosing
    flush()
    buffer.push(tag)
  }

  const handleOpen = (tag) => { // handles opening tags
    flush()
    buffer.push(tag)
    level.unshift(getTagName(tag))
  }

  const handleClose = (tag) => { // handles closing tags
    if (level[0] === getTagName(tag)) {
      flush()
      buffer.push(tag)
      level.shift()
    } else { // Broken case
      textBuffer += tag
    }
  }

  for (let i = 0; i < html.length; i++) {
    const char = html[i]
    if (char === '<' && tagBuffer === null) {
      tagBuffer = char
    } else if (char !== '>' && tagBuffer !== null) {
      tagBuffer += char
    } else if (char === '>' && tagBuffer !== null) {
      tagBuffer += char
      const tagFull = tagBuffer
      tagBuffer = null
      const tagName = getTagName(tagFull)
      if (allElements.has(tagName)) {
        if (linebreakElements.has(tagName)) {
          handleBr(tagFull)
        } else if (nonEmptyElements.has(tagName)) {
          if (tagFull[1] === '/') {
            handleClose(tagFull)
          } else if (tagFull[tagFull.length - 2] === '/') {
            // self-closing
            handleBr(tagFull)
          } else {
            handleOpen(tagFull)
          }
        } else {
          textBuffer += tagFull
        }
      } else {
        textBuffer += tagFull
      }
    } else if (char === '\n') {
      handleBr(char)
    } else {
      textBuffer += char
    }
  }
  if (tagBuffer) {
    textBuffer += tagBuffer
  }

  flush()

  return buffer
}
