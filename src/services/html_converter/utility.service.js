/**
 * Extract tag name from tag opener/closer.
 *
 * @param {String} tag - tag string, i.e. '<a href="...">'
 * @return {String} - tagname, i.e. "div"
 */
export const getTagName = (tag) => {
  const result = /(?:<\/(\w+)>|<(\w+)\s?.*?\/?>)/gi.exec(tag)
  return result && (result[1] || result[2])
}

/**
 * Extract attributes from tag opener.
 *
 * @param {String} tag - tag string, i.e. '<a href="...">'
 * @return {Object} - map of attributes key = attribute name, value = attribute value
 *   attributes without values represented as boolean true
 */
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

/**
 * Finds shortcodes in text
 *
 * @param {String} text - original text to find emojis in
 * @param {{ url: String, shortcode: Sring }[]} emoji - list of shortcodes to find
 * @param {Function} processor - function to call on each encountered emoji,
 *   function is passed single object containing matching emoji ({ url, shortcode })
 *   return value will be inserted into resulting array instead of :shortcode:
 * @return {Array} resulting array with non-emoji parts of text and whatever {processor}
 *   returned for emoji
 */
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
