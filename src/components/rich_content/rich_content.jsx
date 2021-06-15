import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { getTagName, processTextForEmoji, getAttrs } from 'src/services/html_converter/utility.service.js'
import { convertHtmlToTree } from 'src/services/html_converter/html_tree_converter.service.js'
import { convertHtmlToLines } from 'src/services/html_converter/html_line_converter.service.js'
import StillImage from 'src/components/still-image/still-image.vue'
import MentionLink from 'src/components/mention_link/mention_link.vue'
import MentionsLine from 'src/components/mentions_line/mentions_line.vue'

import './rich_content.scss'

/**
 * RichContent, The Über-powered component for rendering Post HTML.
 *
 * This takes post HTML and does multiple things to it:
 * - Converts mention links to <MentionLink>-s
 * - Removes mentions from beginning and end (hellthread style only)
 * - Replaces emoji shortcodes with <StillImage>'d images.
 *
 * Stuff like removing mentions from beginning and end is done so that they could
 * be either replaced by collapsible <MentionsLine>  or moved to separate place.
 * There are two problems with this component's architecture:
 * 1. Parsing HTML and rendering are inseparable. Attempts to separate the two
 *    proven to be a massive overcomplication due to amount of things done here.
 * 2. We need to output both render and some extra data, which seems to be imp-
 *    possible in vue. Current solution is to emit 'parseReady' event when parsing
 *    is done within render() function.
 *
 * Apart from that one small hiccup with emit in render this _should_ be vue3-ready
 */
export default Vue.component('RichContent', {
  name: 'RichContent',
  props: {
    // Original html content
    html: {
      required: true,
      type: String
    },
    // Emoji object, as in status.emojis, note the "s" at the end...
    emoji: {
      required: true,
      type: Array
    },
    // Whether to handle links or not (posts: yes, everything else: no)
    handleLinks: {
      required: false,
      type: Boolean,
      default: false
    },
    // Meme arrows
    greentext: {
      required: false,
      type: Boolean,
      default: false
    },
    hideMentions: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  // NEVER EVER TOUCH DATA INSIDE RENDER
  render (h) {
    // Pre-process HTML
    const { newHtml: html, lastMentions } = preProcessPerLine(this.html, this.greentext, this.handleLinks)
    const firstMentions = [] // Mentions that appear in the beginning of post body
    const lastTags = [] // Tags that appear at the end of post body
    const writtenMentions = [] // All mentions that appear in post body
    const writtenTags = [] // All tags that appear in post body
    // unique index for vue "tag" property
    let mentionIndex = 0
    let tagsIndex = 0
    let firstMentionReplaced = false

    const renderImage = (tag) => {
      return <StillImage
        {...{ attrs: getAttrs(tag) }}
        class="img"
      />
    }

    const renderHashtag = (attrs, children, encounteredTextReverse) => {
      const linkData = getLinkData(attrs, children, tagsIndex++)
      writtenTags.push(linkData)
      attrs.target = '_blank'
      if (!encounteredTextReverse) {
        lastTags.push(linkData)
      }
      return <a {...{ attrs }}>
        { children.map(processItem) }
      </a>
    }

    const renderMention = (attrs, children, encounteredText) => {
      const linkData = getLinkData(attrs, children, mentionIndex++)
      writtenMentions.push(linkData)
      if (!encounteredText) {
        firstMentions.push(linkData)
        if (!firstMentionReplaced && !this.hideMentions) {
          firstMentionReplaced = true
          return <MentionsLine mentions={ firstMentions } />
        } else {
          return ''
        }
      } else {
        return <MentionLink
          url={attrs.href}
          content={flattenDeep(children).join('')}
        />
      }
    }

    // We stop treating mentions as "first" ones when we encounter
    // non-whitespace text
    let encounteredText = false
    // Processor to use with html_tree_converter
    const processItem = (item, index, array, what) => {
      // Handle text nodes - just add emoji
      if (typeof item === 'string') {
        const emptyText = item.trim() === ''
        if (emptyText) {
          return encounteredText ? item : item.trim()
        }
        let unescapedItem = unescape(item)
        if (!encounteredText) {
          unescapedItem = unescapedItem.trimStart()
          encounteredText = true
        }
        if (item.includes(':')) {
          unescapedItem = ['', processTextForEmoji(
            unescapedItem,
            this.emoji,
            ({ shortcode, url }) => {
              return <StillImage
                class="emoji img"
                src={url}
                title={`:${shortcode}:`}
                alt={`:${shortcode}:`}
              />
            }
          )]
        }
        return unescapedItem
      }

      // Handle tag nodes
      if (Array.isArray(item)) {
        const [opener, children, closer] = item
        const Tag = getTagName(opener)
        const attrs = getAttrs(opener)
        switch (Tag) {
          case 'span': // replace images with StillImage
            if (attrs['class'] && attrs['class'].includes('lastMentions')) {
              if (firstMentions.length > 1 && lastMentions.length > 1) {
                break
              } else {
                return !this.hideMentions ? <MentionsLine mentions={lastMentions} /> : ''
              }
            } else {
              break
            }
          case 'img': // replace images with StillImage
            return renderImage(opener)
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            if (attrs['class'] && attrs['class'].includes('mention')) {
              // Handling mentions here
              return renderMention(attrs, children, encounteredText)
            } else {
              // Everything else will be handled in reverse pass
              encounteredText = true
              return item // We'll handle it later
            }
        }

        if (children !== undefined) {
          return [opener, children.map(processItem), closer]
        } else {
          return item
        }
      }
    }

    // Processor for back direction (for finding "last" stuff, just easier this way)
    let encounteredTextReverse = false
    const processItemReverse = (item, index, array, what) => {
      // Handle text nodes - just add emoji
      if (typeof item === 'string') {
        const emptyText = item.trim() === ''
        if (emptyText) return item
        if (!encounteredTextReverse) encounteredTextReverse = true
        return item
      } else if (Array.isArray(item)) {
        // Handle tag nodes
        const [opener, children] = item
        const Tag = opener === '' ? '' : getTagName(opener)
        switch (Tag) {
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            const attrs = getAttrs(opener)
            // should only be this
            if (attrs['class'] && attrs['class'].includes('hashtag')) {
              return renderHashtag(attrs, children, encounteredTextReverse)
            } else {
              attrs.target = '_blank'
              html.includes('freenode') && console.log('PASS1', children)
              const newChildren = [...children].reverse().map(processItemReverse).reverse()
              html.includes('freenode') && console.log('PASS1b', newChildren)

              return <a {...{ attrs }}>
                { newChildren }
              </a>
            }
          case '':
            return [...children].reverse().map(processItemReverse).reverse()
        }

        // Render tag as is
        if (children !== undefined) {
          html.includes('freenode') && console.log('PASS2', children)
          const newChildren = Array.isArray(children)
            ? [...children].reverse().map(processItemReverse).reverse()
            : children
          return <Tag {...{ attrs: getAttrs(opener) }}>
            { newChildren }
          </Tag>
        } else {
          return <Tag/>
        }
      }
      return item
    }

    const pass1 = convertHtmlToTree(html).map(processItem)
    const pass2 = [...pass1].reverse().map(processItemReverse).reverse()
    // DO NOT USE SLOTS they cause a re-render feedback loop here.
    // slots updated -> rerender -> emit -> update up the tree -> rerender -> ...
    // at least until vue3?
    const result = <span class="RichContent">
      { pass2 }
    </span>

    const event = {
      firstMentions,
      lastMentions,
      lastTags,
      writtenMentions,
      writtenTags
    }

    // DO NOT MOVE TO UPDATE. BAD IDEA.
    this.$emit('parseReady', event)

    return result
  }
})

const getLinkData = (attrs, children, index) => {
  return {
    index,
    url: attrs.href,
    hashtag: attrs['data-tag'],
    content: flattenDeep(children).join('')
  }
}

/** Pre-processing HTML
 *
 * Currently this does two things:
 * - add green/cyantexting
 * - wrap and mark last line containing only mentions as ".lastMentionsLine" for
 *   more compact hellthreads.
 *
 * @param {String} html - raw HTML to process
 * @param {Boolean} greentext - whether to enable greentexting or not
 * @param {Boolean} handleLinks - whether to handle links or not
 */
export const preProcessPerLine = (html, greentext, handleLinks) => {
  const lastMentions = []
  const greentextHandle = new Set(['p', 'div'])

  let nonEmptyIndex = -1
  const lines = convertHtmlToLines(html)
  const linesNum = lines.filter(c => c.text).length
  const newHtml = lines.reverse().map((item, index, array) => {
    // Going over each line in reverse to detect last mentions,
    // keeping non-text stuff as-is
    if (!item.text) return item
    const string = item.text
    nonEmptyIndex += 1

    // Greentext stuff
    if (
      // Only if greentext is engaged
      greentext &&
        // Only handle p's and divs. Don't want to affect blocquotes, code etc
        item.level.every(l => greentextHandle.has(l)) &&
        // Only if line begins with '>' or '<'
        (string.includes('&gt;') || string.includes('&lt;'))
    ) {
      const cleanedString = string.replace(/<[^>]+?>/gi, '') // remove all tags
        .replace(/@\w+/gi, '') // remove mentions (even failed ones)
        .trim()
      if (cleanedString.startsWith('&gt;')) {
        return `<span class='greentext'>${string}</span>`
      } else if (cleanedString.startsWith('&lt;')) {
        return `<span class='cyantext'>${string}</span>`
      }
    }

    // Converting that line part into tree
    const tree = convertHtmlToTree(string)

    // If line has loose text, i.e. text outside a mention or a tag
    // we won't touch mentions.
    let hasLooseText = false
    let mentionsNum = 0
    const process = (item) => {
      if (Array.isArray(item)) {
        const [opener, children, closer] = item
        const tag = getTagName(opener)
        // If we have a link we probably have mentions
        if (tag === 'a') {
          if (!handleLinks) return [opener, children, closer]
          const attrs = getAttrs(opener)
          if (attrs['class'] && attrs['class'].includes('mention')) {
            // Got mentions
            mentionsNum++
            return [opener, children, closer]
          } else {
            // Not a mention? Means we have loose text or whatever
            hasLooseText = true
            return [opener, children, closer]
          }
        } else if (tag === 'span' || tag === 'p') {
          // For span and p we need to go deeper
          return [opener, [...children].map(process), closer]
        } else {
          // Everything else equals to a loose text
          hasLooseText = true
          return [opener, children, closer]
        }
      }

      if (typeof item === 'string') {
        if (item.trim() !== '') {
          // only meaningful strings are loose text
          hasLooseText = true
        }
        return item
      }
    }

    // We now processed our tree, now we need to mark line as lastMentions
    const result = [...tree].map(process)

    if (
      handleLinks && // Do we handle links at all?
        mentionsNum > 1 && // Does it have more than one mention?
        !hasLooseText && // Don't do anything if it has something besides mentions
        nonEmptyIndex === 0 && // Only check last (first since list is reversed) line
        nonEmptyIndex !== linesNum - 1 // Don't do anything if there's only one line
    ) {
      let mentionIndex = 0
      const process = (item) => {
        if (Array.isArray(item)) {
          const [opener, children] = item
          const tag = getTagName(opener)
          if (tag === 'a') {
            const attrs = getAttrs(opener)
            lastMentions.push(getLinkData(attrs, children, mentionIndex++))
          } else if (children) {
            children.forEach(process)
          }
        }
      }
      result.forEach(process)
      // we DO need mentions here so that we conditionally remove them if don't
      // have first mentions
      return ['<span class="lastMentions">', flattenDeep(result).join(''), '</span>'].join('')
    } else {
      return flattenDeep(result).join('')
    }
  }).reverse().join('')

  return { newHtml, lastMentions }
}
