import Vue from 'vue'
import { mapGetters } from 'vuex'
import { processHtml } from 'src/services/tiny_post_html_processor/tiny_post_html_processor.service.js'
import { convertHtml, getTagName, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'
import { mentionMatchesUrl, extractTagFromUrl } from 'src/services/matcher/matcher.service.js'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
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
            item,
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
          return item
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
