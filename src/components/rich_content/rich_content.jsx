import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { convertHtmlToTree, getTagName, processTextForEmoji, getAttrs } from 'src/services/html_converter/html_tree_converter.service.js'
import { convertHtmlToLines } from 'src/services/html_converter/html_line_converter.service.js'
import StillImage from 'src/components/still-image/still-image.vue'
import MentionLink from 'src/components/mention_link/mention_link.vue'

import './rich_content.scss'

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
    // Whether to hide last mentions (hellthreads)
    hideMentions: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  // NEVER EVER TOUCH DATA INSIDE RENDER
  render (h) {
    // Pre-process HTML
    const { newHtml: html, lastMentions } = preProcessPerLine(this.html, this.greentext, this.hideMentions)
    const firstMentions = [] // Mentions that appear in the beginning of post body
    const lastTags = [] // Tags that appear at the end of post body
    const writtenMentions = [] // All mentions that appear in post body
    const writtenTags = [] // All tags that appear in post body
    // unique index for vue "tag" property
    let mentionIndex = 0
    let tagsIndex = 0

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
        attrs['data-parser-last'] = true
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
        return ''
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
          unescapedItem = processTextForEmoji(
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
          )
        }
        return unescapedItem
      }

      // Handle tag nodes
      if (Array.isArray(item)) {
        const [opener, children] = item
        const Tag = getTagName(opener)
        const attrs = getAttrs(opener)
        switch (Tag) {
          case 'span': // replace images with StillImage
            if (attrs['class'] && attrs['class'].includes('lastMentions')) {
              if (firstMentions.length > 1) {
                break
              } else {
                return ''
              }
            } else {
              break
            }
          case 'img': // replace images with StillImage
            return renderImage(opener)
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            if (attrs['class'] && attrs['class'].includes('mention')) {
              return renderMention(attrs, children, encounteredText)
            } else if (attrs['class'] && attrs['class'].includes('hashtag')) {
              encounteredText = true
              return item // We'll handle it later
            } else {
              attrs.target = '_blank'
              return <a {...{ attrs }}>
                { children.map(processItem) }
              </a>
            }
        }

        // Render tag as is
        if (children !== undefined) {
          return <Tag {...{ attrs: getAttrs(opener) }}>
            { children.map(processItem) }
          </Tag>
        } else {
          return <Tag/>
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
        const Tag = getTagName(opener)
        switch (Tag) {
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            const attrs = getAttrs(opener)
            // should only be this
            if (attrs['class'] && attrs['class'].includes('hashtag')) {
              return renderHashtag(attrs, children, encounteredTextReverse)
            }
        }
      }
      return item
    }

    // DO NOT USE SLOTS they cause a re-render feedback loop here.
    // slots updated -> rerender -> emit -> update up the tree -> rerender -> ...
    // at least until vue3?
    const result = <span class="RichContent">
      { convertHtmlToTree(html).map(processItem).reverse().map(processItemReverse).reverse() }
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
 */
export const preProcessPerLine = (html, greentext) => {
  const lastMentions = []

  let nonEmptyIndex = 0
  const newHtml = convertHtmlToLines(html).reverse().map((item, index, array) => {
    // Going over each line in reverse to detect last mentions,
    // keeping non-text stuff as-is
    if (!item.text) return item
    const string = item.text

    // Greentext stuff
    if (greentext && (string.includes('&gt;') || string.includes('&lt;'))) {
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
    let hasMentions = false
    const process = (item) => {
      if (Array.isArray(item)) {
        const [opener, children, closer] = item
        const tag = getTagName(opener)
        // If we have a link we probably have mentions
        if (tag === 'a') {
          const attrs = getAttrs(opener)
          if (attrs['class'] && attrs['class'].includes('mention')) {
            // Got mentions
            hasMentions = true
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

    // Only check last (first since list is reversed) line
    if (hasMentions && !hasLooseText && nonEmptyIndex++ === 0) {
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
