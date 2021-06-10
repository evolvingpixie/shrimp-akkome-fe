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
    hideLastMentions: {
      required: false,
      type: Boolean,
      default: false
    },
    // Whether to hide first mentions
    hideFirstMentions: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  render (h) {
    // Pre-process HTML
    const html = preProcessPerLine(this.html, this.greentext, this.hideLastMentions)
    console.log(this.hideFirstMentions, this.hideLastMentions)

    const renderImage = (tag) => {
      return <StillImage
        {...{ attrs: getAttrs(tag) }}
        class="img"
      />
    }

    const renderMention = (attrs, children, encounteredText) => {
      return (this.hideFirstMentions && !encounteredText)
        ? ''
        : <MentionLink
          url={attrs.href}
          content={flattenDeep(children).join('')}
          firstMention={!encounteredText}
        />
    }

    // We stop treating mentions as "first" ones when we encounter
    // non-whitespace text
    let encounteredText = false
    // Processor to use with mini_html_converter
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
        switch (Tag) {
          case 'img': // replace images with StillImage
            return renderImage(opener)
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            const attrs = getAttrs(opener)
            if (attrs['class'] && attrs['class'].includes('mention')) {
              return renderMention(attrs, children, encounteredText)
            } else if (attrs['class'] && attrs['class'].includes('hashtag')) {
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
    const renderHashtag = (attrs, children, encounteredTextReverse) => {
      attrs.target = '_blank'
      if (!encounteredTextReverse) {
        attrs['data-parser-last'] = true
      }
      return <a {...{ attrs }}>
        { children.map(processItem) }
      </a>
    }
    const processItemReverse = (item, index, array, what) => {
      // Handle text nodes - just add emoji
      if (typeof item === 'string') {
        const emptyText = item.trim() === ''
        if (emptyText) return encounteredTextReverse ? item : item.trim()
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
    return <span class="RichContent">
      { this.$slots.prefix }
      { convertHtmlToTree(html).map(processItem).reverse().map(processItemReverse).reverse() }
      { this.$slots.suffix }
    </span>
  }
})

/** Pre-processing HTML
 *
 * Currently this does two things:
 * - add green/cyantexting
 * - wrap and mark last line containing only mentions as ".lastMentionsLine" for
 *   more compact hellthreads.
 *
 * @param {String} html - raw HTML to process
 * @param {Boolean} greentext - whether to enable greentexting or not
 * @param {Boolean} removeLastMentions - whether to remove last mentions
 */
export const preProcessPerLine = (html, greentext, removeLastMentions) => {
  // Only mark first (last) encounter
  let lastMentionsMarked = false

  return convertHtmlToLines(html).reverse().map((item, index, array) => {
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

    const tree = convertHtmlToTree(string)

    // If line has loose text, i.e. text outside a mention or a tag
    // we won't touch mentions.
    let hasLooseText = false
    let hasMentions = false
    const process = (item) => {
      if (Array.isArray(item)) {
        const [opener, children, closer] = item
        const tag = getTagName(opener)
        if (tag === 'a') {
          const attrs = getAttrs(opener)
          if (attrs['class'] && attrs['class'].includes('mention')) {
            hasMentions = true
            return [opener, children, closer]
          } else {
            hasLooseText = true
            return [opener, children, closer]
          }
        } else if (tag === 'span' || tag === 'p') {
          return [opener, [...children].reverse().map(process).reverse(), closer]
        } else {
          hasLooseText = true
          return [opener, children, closer]
        }
      }

      if (typeof item === 'string') {
        if (item.trim() !== '') {
          hasLooseText = true
        }
        return item
      }
    }

    const result = [...tree].reverse().map(process).reverse()

    if (removeLastMentions && hasMentions && !hasLooseText && !lastMentionsMarked) {
      lastMentionsMarked = true
      return ''
    } else {
      return flattenDeep(result).join('')
    }
  }).reverse().join('')
}

export const getHeadTailLinks = (html) => {
  // Exported object properties
  const firstMentions = [] // Mentions that appear in the beginning of post body
  const lastMentions = [] // Mentions that appear at the end of post body
  const lastTags = [] // Tags that appear at the end of post body
  const writtenMentions = [] // All mentions that appear in post body
  const writtenTags = [] // All tags that appear in post body

  let encounteredText = false
  let processingFirstMentions = true
  let index = 0 // unique index for vue "tag" property

  const getLinkData = (attrs, children, index) => {
    return {
      index,
      url: attrs.href,
      hashtag: attrs['data-tag'],
      content: flattenDeep(children).join('')
    }
  }

  // Processor to use with html_tree_converter
  const processItem = (item) => {
    // Handle text nodes - stop treating mentions as "first" when text encountered
    if (typeof item === 'string') {
      const emptyText = item.trim() === ''
      if (emptyText) return
      if (!encounteredText) {
        encounteredText = true
        processingFirstMentions = false
      }
      // Encountered text? That means tags we've been collectings aren't "last"!
      lastTags.splice(0)
      lastMentions.splice(0)
      return
    }
    // Handle tag nodes
    if (Array.isArray(item)) {
      const [opener, children] = item
      const Tag = getTagName(opener)
      if (Tag !== 'a') return children && children.forEach(processItem)
      const attrs = getAttrs(opener)
      if (attrs['class']) {
        const linkData = getLinkData(attrs, children, index++)
        if (attrs['class'].includes('mention')) {
          if (processingFirstMentions) {
            firstMentions.push(linkData)
          }
          writtenMentions.push(linkData)
          lastMentions.push(linkData)
        } else if (attrs['class'].includes('hashtag')) {
          lastTags.push(linkData)
          writtenTags.push(linkData)
        }
        return // Stop processing, we don't care about link's contents
      }
      children && children.forEach(processItem)
    }
  }
  convertHtmlToTree(html).forEach(processItem)
  return { firstMentions, writtenMentions, writtenTags, lastTags, lastMentions }
}
