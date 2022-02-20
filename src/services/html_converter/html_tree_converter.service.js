import { getTagName } from './utility.service.js'
import { unescape } from 'lodash'

/**
 * This is a not-so-tiny purpose-built HTML parser/processor. This parses html
 * and converts it into a tree structure representing tag openers/closers and
 * children.
 *
 * Structure follows this pattern: [opener, [...children], closer] except root
 * node which is just [...children]. Text nodes can only be within children and
 * are represented as strings.
 *
 * Intended use is to convert HTML structure and then recursively iterate over it
 * most likely using a map. Very useful for dynamically rendering html replacing
 * tags with JSX elements in a render function.
 *
 * known issue: doesn't handle CDATA so CDATA might not work well
 * known issue: doesn't handle HTML comments
 *
 * @param {Object} input - input data
 * @return {string} processed html
 */
export const convertHtmlToTree = (html = '') => {
  // Elements that are implicitly self-closing
  // https://developer.mozilla.org/en-US/docs/Glossary/empty_element
  const emptyElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ])
  // TODO For future - also parse HTML5 multi-source components?

  const buffer = [] // Current output buffer
  const levels = [['', buffer]] // How deep we are in tags and which tags were there
  let textBuffer = '' // Current line content
  let tagBuffer = null // Current tag buffer, if null = we are not currently reading a tag

  const getCurrentBuffer = () => {
    return levels[levels.length - 1][1]
  }

  const flushText = () => { // Processes current line buffer, adds it to output buffer and clears line buffer
    if (textBuffer === '') return
    getCurrentBuffer().push(textBuffer)
    textBuffer = ''
  }

  const handleSelfClosing = (tag) => {
    getCurrentBuffer().push([tag])
  }

  const handleOpen = (tag) => {
    const curBuf = getCurrentBuffer()
    const newLevel = [unescape(tag), []]
    levels.push(newLevel)
    curBuf.push(newLevel)
  }

  const handleClose = (tag) => {
    const currentTag = levels[levels.length - 1]
    if (getTagName(levels[levels.length - 1][0]) === getTagName(tag)) {
      currentTag.push(tag)
      levels.pop()
    } else {
      getCurrentBuffer().push(tag)
    }
  }

  for (let i = 0; i < html.length; i++) {
    const char = html[i]
    if (char === '<' && tagBuffer === null) {
      flushText()
      tagBuffer = char
    } else if (char !== '>' && tagBuffer !== null) {
      tagBuffer += char
    } else if (char === '>' && tagBuffer !== null) {
      tagBuffer += char
      const tagFull = tagBuffer
      tagBuffer = null
      const tagName = getTagName(tagFull)
      if (tagFull[1] === '/') {
        handleClose(tagFull)
      } else if (emptyElements.has(tagName) || tagFull[tagFull.length - 2] === '/') {
        // self-closing
        handleSelfClosing(tagFull)
      } else {
        handleOpen(tagFull)
      }
    } else {
      textBuffer += char
    }
  }
  if (tagBuffer) {
    textBuffer += tagBuffer
  }

  flushText()
  return buffer
}
