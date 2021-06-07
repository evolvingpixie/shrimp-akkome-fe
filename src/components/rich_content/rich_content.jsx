import Vue from 'vue'
import { unescape } from 'lodash'
import { convertHtml, getTagName, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'
import StillImage from 'src/components/still-image/still-image.vue'

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
      return <StillImage {...{ attrs: getAttrs(tag) }} />
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
                class="emoji"
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
        if (Tag === 'img') {
          return renderImage(opener)
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
    return <div>
      { structure.map(processItem) }
    </div>
  }
})
