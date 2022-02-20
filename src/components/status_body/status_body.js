import fileType from 'src/services/file_type/file_type.service'
import RichContent from 'src/components/rich_content/rich_content.jsx'
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
    'compact',
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
      expandingSubject: !this.$store.getters.mergedConfig.collapseMessageWithSubject,
      postLength: this.status.text.length,
      parseReadyDone: false
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
      if (this.singleLine || this.compact) return false
      const lengthScore = this.status.raw_html.split(/<p|<br/).length + this.postLength / 80
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
    attachmentTypes () {
      return this.status.attachments.map(file => fileType.fileType(file.mimetype))
    },
    ...mapGetters(['mergedConfig'])
  },
  components: {
    RichContent
  },
  mounted () {
    this.status.attentions && this.status.attentions.forEach(attn => {
      const { id } = attn
      this.$store.dispatch('fetchUserIfMissing', id)
    })
  },
  methods: {
    onParseReady (event) {
      if (this.parseReadyDone) return
      this.parseReadyDone = true
      this.$emit('parseReady', event)
      const { writtenMentions, invisibleMentions } = event
      writtenMentions
        .filter(mention => !mention.notifying)
        .forEach(mention => {
          const { content, url } = mention
          const cleanedString = content.replace(/<[^>]+?>/gi, '') // remove all tags
          if (!cleanedString.startsWith('@')) return
          const handle = cleanedString.slice(1)
          const host = url.replace(/^https?:\/\//, '').replace(/\/.+?$/, '')
          this.$store.dispatch('fetchUserIfMissing', `${handle}@${host}`)
        })
      /* This is a bit of a hack to make current tall status detector work
       * with rich mentions. Invisible mentions are detected at RichContent level
       * and also we generate plaintext version of mentions by stripping tags
       * so here we subtract from post length by each mention that became invisible
       * via MentionsLine
       */
      this.postLength = invisibleMentions.reduce((acc, mention) => {
        return acc - mention.textContent.length - 1
      }, this.postLength)
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
