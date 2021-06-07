import Vue from 'vue'
import { unescape, flattenDeep } from 'lodash'
import { convertHtml, getTagName, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'
import StillImage from 'src/components/still-image/still-image.vue'
import MentionLink from 'src/components/mention_link/mention_link.vue'

import './rich_content.scss'

export default Vue.component('RichContent', {
  name: 'RichContent',
  props: {
    html: {
      required: true,
      type: String
    },
    emoji: {
      required: true,
      type: Array
    }
  },
  render (h) {
    const renderImage = (tag) => {
      const attrs = getAttrs(tag)
      return <StillImage {...{ attrs }} class="img"/>
    }
    const renderMention = (attrs, children) => {
      return <MentionLink url={attrs.href} content={flattenDeep(children).join('')} origattrs={attrs}/>
    }
    const structure = convertHtml(this.html)
    const processItem = (item) => {
      if (typeof item === 'string') {
        if (item.includes(':')) {
          return processTextForEmoji(
            unescape(item),
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
          return unescape(item)
        }
      }
      if (Array.isArray(item)) {
        const [opener, children] = item
        const Tag = getTagName(opener)
        switch (Tag) {
          case 'img':
            return renderImage(opener)
          case 'a':
            const attrs = getAttrs(opener)
            if (attrs['class'] && attrs['class'].includes('mention')) {
              return renderMention(attrs, children)
            }
        }
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
      { structure.map(processItem) }
    </span>
  }
})
