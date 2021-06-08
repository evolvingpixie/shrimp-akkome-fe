import fileType from 'src/services/file_type/file_type.service'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import MentionsLine from 'src/components/mentions_line/mentions_line.vue'
import { processHtml } from 'src/services/tiny_post_html_processor/tiny_post_html_processor.service.js'
import { extractTagFromUrl } from 'src/services/matcher/matcher.service.js'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile,
  faMusic,
  faImage,
  faLink,
  faPollH
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faFile,
  faMusic,
  faImage,
  faLink,
  faPollH
)

const StatusContent = {
  name: 'StatusContent',
  props: [
    'status',
    'focused',
    'noHeading',
    'fullContent',
    'singleLine'
  ],
  data () {
    return {
      showingTall: this.fullContent || (this.inConversation && this.focused),
      showingLongSubject: false,
      // not as computed because it sets the initial state which will be changed later
      expandingSubject: !this.$store.getters.mergedConfig.collapseMessageWithSubject
    }
  },
  computed: {
    localCollapseSubjectDefault () {
      return this.mergedConfig.collapseMessageWithSubject
    },
    // This is a bit hacky, but we want to approximate post height before rendering
    // so we count newlines (masto uses <p> for paragraphs, GS uses <br> between them)
    // as well as approximate line count by counting characters and approximating ~80
    // per line.
    //
    // Using max-height + overflow: auto for status components resulted in false positives
    // very often with japanese characters, and it was very annoying.
    tallStatus () {
      const lengthScore = this.status.statusnet_html.split(/<p|<br/).length + this.status.text.length / 80
      return lengthScore > 20
    },
    longSubject () {
      return this.status.summary.length > 240
    },
    // When a status has a subject and is also tall, we should only have one show more/less button. If the default is to collapse statuses with subjects, we just treat it like a status with a subject; otherwise, we just treat it like a tall status.
    mightHideBecauseSubject () {
      return !!this.status.summary && this.localCollapseSubjectDefault
    },
    mightHideBecauseTall () {
      return this.tallStatus && !(this.status.summary && this.localCollapseSubjectDefault)
    },
    hideSubjectStatus () {
      return this.mightHideBecauseSubject && !this.expandingSubject
    },
    hideTallStatus () {
      return this.mightHideBecauseTall && !this.showingTall
    },
    showingMore () {
      return (this.mightHideBecauseTall && this.showingTall) || (this.mightHideBecauseSubject && this.expandingSubject)
    },
    postBodyHtml () {
      const html = this.status.raw_html

      if (this.mergedConfig.greentext) {
        try {
          if (html.includes('&gt;')) {
            // This checks if post has '>' at the beginning, excluding mentions so that @mention >impying works
            return processHtml(html, (string) => {
              if (string.includes('&gt;') &&
                  string
                    .replace(/<[^>]+?>/gi, '') // remove all tags
                    .replace(/@\w+/gi, '') // remove mentions (even failed ones)
                    .trim()
                    .startsWith('&gt;')) {
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
      } else {
        return html
      }
    },
    attachmentTypes () {
      return this.status.attachments.map(file => fileType.fileType(file.mimetype))
    },
    mentionsOwnLine () {
      return this.mergedConfig.mentionsOwnLine
    },
    mentions () {
      return this.status.attentions
    },
    ...mapGetters(['mergedConfig'])
  },
  components: {
    RichContent,
    MentionsLine
  },
  mounted () {
    this.status.attentions && this.status.attentions.forEach(attn => {
      const { id } = attn
      this.$store.dispatch('fetchUserIfMissing', id)
    })
  },
  methods: {
    linkClicked (event) {
      const target = event.target.closest('.status-content a')
      if (target) {
        if (target.rel.match(/(?:^|\s)tag(?:$|\s)/) || target.className.match(/hashtag/)) {
          // Extract tag name from dataset or link url
          const tag = target.dataset.tag || extractTagFromUrl(target.href)
          if (tag) {
            const link = this.generateTagLink(tag)
            this.$router.push(link)
            return
          }
        }
        window.open(target.href, '_blank')
      }
    },
    toggleShowMore () {
      if (this.mightHideBecauseTall) {
        this.showingTall = !this.showingTall
      } else if (this.mightHideBecauseSubject) {
        this.expandingSubject = !this.expandingSubject
      }
    },
    generateTagLink (tag) {
      return `/tag/${tag}`
    }
  }
}

export default StatusContent
