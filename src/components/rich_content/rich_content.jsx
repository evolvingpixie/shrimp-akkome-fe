import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { getTagName, processTextForEmoji, getAttrs } from 'src/services/html_converter/utility.service.js'
import { convertHtmlToTree } from 'src/services/html_converter/html_tree_converter.service.js'
import { convertHtmlToLines } from 'src/services/html_converter/html_line_converter.service.js'
import StillImage from 'src/components/still-image/still-image.vue'
import MentionsLine, { MENTIONS_LIMIT } from 'src/components/mentions_line/mentions_line.vue'
import HashtagLink from 'src/components/hashtag_link/hashtag_link.vue'

import './rich_content.scss'

/**
 * RichContent, The Über-powered component for rendering Post HTML.
 *
 * This takes post HTML and does multiple things to it:
 * - Groups all mentions into <MentionsLine>, this affects all mentions regardles
 *   of where they are (beginning/middle/end), even single mentions are converted
 *   to a <MentionsLine> containing single <MentionLink>.
 * - Replaces emoji shortcodes with <StillImage>'d images.
 *
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
    attentions: {
      required: false,
      default: () => []
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
    }
  },
  // NEVER EVER TOUCH DATA INSIDE RENDER
  render (h) {
    // Pre-process HTML
    const { newHtml: html } = preProcessPerLine(this.html, this.greentext)
    let currentMentions = null // Current chain of mentions, we group all mentions together
    // This is used to recover spacing removed when parsing mentions
    let lastSpacing = ''

    const lastTags = [] // Tags that appear at the end of post body
    const writtenMentions = [] // All mentions that appear in post body
    const invisibleMentions = [] // All mentions that go beyond the limiter (see MentionsLine)
    // to collapse too many mentions in a row
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
      if (!encounteredTextReverse) {
        lastTags.push(linkData)
      }
      return <HashtagLink {...{ props: linkData }}/>
    }

    const renderMention = (attrs, children) => {
      const linkData = getLinkData(attrs, children, mentionIndex++)
      linkData.notifying = this.attentions.some(a => a.statusnet_profile_url === linkData.url)
      writtenMentions.push(linkData)
      if (currentMentions === null) {
        currentMentions = []
      }
      currentMentions.push(linkData)
      if (currentMentions.length > MENTIONS_LIMIT) {
        invisibleMentions.push(linkData)
      }
      if (currentMentions.length === 1) {
        return <MentionsLine mentions={ currentMentions } />
      } else {
        return ''
      }
    }

    // Processor to use with html_tree_converter
    const processItem = (item, index, array, what) => {
      // Handle text nodes - just add emoji
      if (typeof item === 'string') {
        const emptyText = item.trim() === ''
        if (item.includes('\n')) {
          currentMentions = null
        }
        if (emptyText) {
          // don't include spaces when processing mentions - we'll include them
          // in MentionsLine
          lastSpacing = item
          return currentMentions !== null ? item.trim() : item
        }

        currentMentions = null
        if (item.includes(':')) {
          item = ['', processTextForEmoji(
            item,
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
        return item
      }

      // Handle tag nodes
      if (Array.isArray(item)) {
        const [opener, children, closer] = item
        const Tag = getTagName(opener)
        const attrs = getAttrs(opener)
        const previouslyMentions = currentMentions !== null
        /* During grouping of mentions we trim all the empty text elements
         * This padding is added to recover last space removed in case
         * we have a tag right next to mentions
         */
        const mentionsLinePadding =
              // Padding is only needed if we just finished parsing mentions
              previouslyMentions &&
              // Don't add padding if content is string and has padding already
              !(children && typeof children[0] === 'string' && children[0].match(/^\s/))
                ? lastSpacing
                : ''
        switch (Tag) {
          case 'br':
            currentMentions = null
            break
          case 'img': // replace images with StillImage
            return ['', [mentionsLinePadding, renderImage(opener)], '']
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            if (attrs['class'] && attrs['class'].includes('mention')) {
              // Handling mentions here
              return renderMention(attrs, children)
            } else {
              currentMentions = null
              break
            }
          case 'span':
            if (this.handleLinks && attrs['class'] && attrs['class'].includes('h-card')) {
              return ['', children.map(processItem), '']
            }
        }

        if (children !== undefined) {
          return [
            '',
            [
              mentionsLinePadding,
              [opener, children.map(processItem), closer]
            ],
            ''
          ]
        } else {
          return ['', [mentionsLinePadding, item], '']
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
        return unescape(item)
      } else if (Array.isArray(item)) {
        // Handle tag nodes
        const [opener, children] = item
        const Tag = opener === '' ? '' : getTagName(opener)
        switch (Tag) {
          case 'a': // replace mentions with MentionLink
            if (!this.handleLinks) break
            const attrs = getAttrs(opener)
            // should only be this
            if (
              (attrs['class'] && attrs['class'].includes('hashtag')) || // Pleroma style
                (attrs['rel'] === 'tag') // Mastodon style
            ) {
              return renderHashtag(attrs, children, encounteredTextReverse)
            } else {
              attrs.target = '_blank'
              const newChildren = [...children].reverse().map(processItemReverse).reverse()

              return <a {...{ attrs }}>
                { newChildren }
              </a>
            }
          case '':
            return [...children].reverse().map(processItemReverse).reverse()
        }

        // Render tag as is
        if (children !== undefined) {
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
      lastTags,
      writtenMentions,
      writtenTags,
      invisibleMentions
    }

    // DO NOT MOVE TO UPDATE. BAD IDEA.
    this.$emit('parseReady', event)

    return result
  }
})

const getLinkData = (attrs, children, index) => {
  const stripTags = (item) => {
    if (typeof item === 'string') {
      return item
    } else {
      return item[1].map(stripTags).join('')
    }
  }
  const textContent = children.map(stripTags).join('')
  return {
    index,
    url: attrs.href,
    tag: attrs['data-tag'],
    content: flattenDeep(children).join(''),
    textContent
  }
}

/** Pre-processing HTML
 *
 * Currently this does one thing:
 * - add green/cyantexting
 *
 * @param {String} html - raw HTML to process
 * @param {Boolean} greentext - whether to enable greentexting or not
 */
export const preProcessPerLine = (html, greentext) => {
  const greentextHandle = new Set(['p', 'div'])

  const lines = convertHtmlToLines(html)
  const newHtml = lines.reverse().map((item, index, array) => {
    if (!item.text) return item
    const string = item.text

    // Greentext stuff
    if (
      // Only if greentext is engaged
      greentext &&
        // Only handle p's and divs. Don't want to affect blockquotes, code etc
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

    return string
  }).reverse().join('')

  return { newHtml }
}
