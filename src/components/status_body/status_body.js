import fileType from 'src/services/file_type/file_type.service'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import MentionsLine from 'src/components/mentions_line/mentions_line.vue'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import { set } from 'vue'
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
    'singleLine',
    'hideMentions'
  ],
  data () {
    return {
      showingTall: this.fullContent || (this.inConversation && this.focused),
      showingLongSubject: false,
      // not as computed because it sets the initial state which will be changed later
      expandingSubject: !this.$store.getters.mergedConfig.collapseMessageWithSubject,
      headTailLinks: null,
      firstMentions: [],
      lastMentions: []
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
      const lengthScore = this.status.raw_html.split(/<p|<br/).length + this.status.text.length / 80
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
    toggleShowMore () {
      if (this.mightHideBecauseTall) {
        this.showingTall = !this.showingTall
      } else if (this.mightHideBecauseSubject) {
        this.expandingSubject = !this.expandingSubject
      }
    },
    setHeadTailLinks (headTailLinks) {
      set(this, 'headTailLinks', headTailLinks)
      set(this, 'firstMentions', headTailLinks.firstMentions)
      set(this, 'lastMentions', headTailLinks.lastMentions)
    },
    generateTagLink (tag) {
      return `/tag/${tag}`
    }
  }
}

export default StatusContent
