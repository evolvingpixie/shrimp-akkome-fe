import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { convertHtml, getTagName, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'
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
    }
  },
  render (h) {
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

    let encounteredText = false
    // Processor to use with mini_html_converter
    const processItem = (item) => {
      // Handle text noes - just add emoji
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
      { convertHtml(this.html).map(processItem) }
    </span>
  }
})
