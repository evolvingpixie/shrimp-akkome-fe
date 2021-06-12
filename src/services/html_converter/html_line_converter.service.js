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
export const convertHtmlToLines = (html) => {
  const ignoredTags = new Set(['code', 'blockquote'])
  const handledTags = new Set(['p', 'br', 'div', 'pre', 'code', 'blockquote'])
  const openCloseTags = new Set(['p', 'div', 'pre', 'code', 'blockquote'])

  let buffer = [] // Current output buffer
  const level = [] // How deep we are in tags and which tags were there
  let textBuffer = '' // Current line content
  let tagBuffer = null // Current tag buffer, if null = we are not currently reading a tag

  const flush = () => { // Processes current line buffer, adds it to output buffer and clears line buffer
    if (textBuffer.trim().length > 0 && !level.some(l => ignoredTags.has(l))) {
      buffer.push({ text: textBuffer })
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
    flush()
    buffer.push(tag)
    if (level[0] === getTagName(tag)) {
      level.shift()
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
      if (handledTags.has(tagName)) {
        if (tagName === 'br') {
          handleBr(tagFull)
        } else if (openCloseTags.has(tagName)) {
          if (tagFull[1] === '/') {
            handleClose(tagFull)
          } else if (tagFull[tagFull.length - 2] === '/') {
            // self-closing
            handleBr(tagFull)
          } else {
            handleOpen(tagFull)
          }
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
