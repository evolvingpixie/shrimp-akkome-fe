import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { convertHtml, getTagName, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'
import { processHtml } from 'src/services/tiny_post_html_processor/tiny_post_html_processor.service.js'
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
    }
  },
  render (h) {
    // Pre-process HTML
    const html = this.greentext ? addGreentext(this.html) : this.html

    const renderImage = (tag) => {
      return <StillImage
        {...{ attrs: getAttrs(tag) }}
        class="img"
      />
    }

    const renderMention = (attrs, children, encounteredText) => {
      return <MentionLink
        url={attrs.href}
        content={flattenDeep(children).join('')}
        firstMention={!encounteredText}
      />
    }

    // We stop treating mentions as "first" ones when we encounter
    // non-whitespace text
    let encounteredText = false
    // Processor to use with mini_html_converter
    const processItem = (item) => {
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
          return processTextForEmoji(
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
        } else {
          return unescapedItem
        }
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
    return <span class="RichContent">
      { this.$slots.prefix }
      { convertHtml(html).map(processItem) }
      { this.$slots.suffix }
    </span>
  }
})

export const addGreentext = (html) => {
  try {
    if (html.includes('&gt;')) {
      // This checks if post has '>' at the beginning, excluding mentions so that @mention >impying works
      return processHtml(html, (string) => {
        if (
          string.includes('&gt;') && string
            .replace(/<[^>]+?>/gi, '') // remove all tags
            .replace(/@\w+/gi, '') // remove mentions (even failed ones)
            .trim()
            .startsWith('&gt;')
        ) {
          return `<span class='greentext'>${string}</span>`
        } else {
          return string
        }
      })
    } else {
      return html
    }
  } catch (e) {
    console.error('Failed to process status html', e)
    return html
  }
}

export const getHeadTailLinks = (html) => {
  // Exported object properties
  const firstMentions = [] // Mentions that appear in the beginning of post body
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

  // Processor to use with mini_html_converter
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
        } else if (attrs['class'].includes('hashtag')) {
          lastTags.push(linkData)
          writtenTags.push(linkData)
        }
        return // Stop processing, we don't care about link's contents
      }
      children && children.forEach(processItem)
    }
  }
  convertHtml(html).forEach(processItem)
  return { firstMentions, writtenMentions, writtenTags, lastTags }
}
