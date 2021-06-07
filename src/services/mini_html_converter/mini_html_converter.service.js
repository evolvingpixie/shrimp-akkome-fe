/**
 * This is a not-so-tiny purpose-built HTML parser/processor. It was made for use
 * with StatusText component for purpose of replacing tags with vue components
 *
 * known issue: doesn't handle CDATA so nested CDATA might not work well
 *
 * @param {Object} input - input data
 * @param {(string) => string} lineProcessor - function that will be called on every line
 * @param {{ key[string]: (string) => string}} tagProcessor - map of processors for tags
 * @return {string} processed html
 */
export const convertHtml = (html) => {
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
    const newLevel = [tag, []]
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

// Extracts tag name from tag, i.e. <span a="b"> => span
export const getTagName = (tag) => {
  const result = /(?:<\/(\w+)>|<(\w+)\s?.*?\/?>)/gi.exec(tag)
  return result && (result[1] || result[2])
}

export const processTextForEmoji = (text, emojis, processor) => {
  const buffer = []
  let textBuffer = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === ':') {
      const next = text.slice(i + 1)
      let found = false
      for (let emoji of emojis) {
        if (next.slice(0, emoji.shortcode.length + 1) === (emoji.shortcode + ':')) {
          found = emoji
          break
        }
      }
      if (found) {
        buffer.push(textBuffer)
        textBuffer = ''
        buffer.push(processor(found))
        i += found.shortcode.length + 1
      } else {
        textBuffer += char
      }
    } else {
      textBuffer += char
    }
  }
  if (textBuffer) buffer.push(textBuffer)
  return buffer
}

export const getAttrs = tag => {
  const innertag = tag
    .substring(1, tag.length - 1)
    .replace(new RegExp('^' + getTagName(tag)), '')
    .replace(/\/?$/, '')
    .trim()
  const attrs = Array.from(innertag.matchAll(/([a-z0-9-]+)(?:=("[^"]+?"|'[^']+?'))?/gi))
    .map(([trash, key, value]) => [key, value])
    .map(([k, v]) => {
      if (!v) return [k, true]
      return [k, v.substring(1, v.length - 1)]
    })
  return Object.fromEntries(attrs)
}
