import { defineComponent } from 'vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import { marked } from 'marked'
import markedMfm from 'marked-mfm'

export default defineComponent({
  components: {
    RichContent
  },
  props: {
    status: {
      type: Object,
      required: true
    }
  },
  render () {
    marked.use(markedMfm, {
      mangle: false,
      gfm: false,
      breaks: true
    })
    return <RichContent
      handle-links="true"
      html={marked.parse(this.status.mfm_content)}
      emoji={this.status.emojis}
      class="text media-body"
    />
  }
})
