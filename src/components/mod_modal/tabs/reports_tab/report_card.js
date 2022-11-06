import Popover from 'src/components/popover/popover.vue'
import Status from 'src/components/status/status.vue'
import UserAvatar from 'src/components/user_avatar/user_avatar.vue'
import ReportNote from './report_note.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronDown,
  faChevronUp
)

const FORCE_NSFW = 'mrf_tag:media-force-nsfw'
const STRIP_MEDIA = 'mrf_tag:media-strip'
const FORCE_UNLISTED = 'mrf_tag:force-unlisted'
const SANDBOX = 'mrf_tag:sandbox'

const ReportCard = {
  data () {
    return {
      hidden: true,
      statusesHidden: true,
      notesHidden: true,
      note: null,
      tags: {
        FORCE_NSFW,
        STRIP_MEDIA,
        FORCE_UNLISTED,
        SANDBOX
      }
    }
  },
  props: [
    'account',
    'actor',
    'content',
    'id',
    'notes',
    'state',
    'statuses'
  ],
  components: {
    ReportNote,
    Popover,
    Status,
    UserAvatar
  },
  created () {
    this.$store.dispatch('fetchUser', this.account.id)
  },
  computed: {
    isOpen () {
      return this.state === 'open'
    },
    tagPolicyEnabled () {
      return this.$store.state.instance.federationPolicy.mrf_policies.includes('TagPolicy')
    },
    user () {
      return this.$store.getters.findUser(this.account.id)
    }
  },
  methods: {
    toggleHidden () {
      this.hidden = !this.hidden
    },
    decode (content) {
      content = content.replaceAll('<br/>', '\n')
      const textarea = document.createElement('textarea')
      textarea.innerHTML = content
      return textarea.value
    },
    updateReportState (state) {
      this.$store.dispatch('updateReportStates', { reports: [{ id: this.id, state }] })
    },
    toggleNotes () {
      this.notesHidden = !this.notesHidden
    },
    addNoteToReport () {
      if (this.note.length > 0) {
        this.$store.dispatch('addNoteToReport', { id: this.id, note: this.note })
        this.note = null
      }
    },
    toggleStatuses () {
      this.statusesHidden = !this.statusesHidden
    },
    hasTag (tag) {
      return this.user.tags.includes(tag)
    },
    toggleTag (tag) {
      if (this.hasTag(tag)) {
        this.$store.state.api.backendInteractor.untagUser({ user: this.user, tag }).then(response => {
          if (!response.ok) { return }
          this.$store.commit('untagUser', { user: this.user, tag })
        })
      } else {
        this.$store.state.api.backendInteractor.tagUser({ user: this.user, tag }).then(response => {
          if (!response.ok) { return }
          this.$store.commit('tagUser', { user: this.user, tag })
        })
      }
    },
    toggleActivationStatus () {
      this.$store.dispatch('toggleActivationStatus', { user: this.user })
    },
    deleteUser () {
      this.$store.state.backendInteractor.deleteUser({ user: this.user })
        .then(e => {
          this.$store.dispatch('markStatusesAsDeleted', status => this.user.id === status.user.id)
          const isProfile = this.$route.name === 'external-user-profile' || this.$route.name === 'user-profile'
          const isTargetUser = this.$route.params.name === this.user.name || this.$route.params.id === this.user.id
          if (isProfile && isTargetUser) {
            window.history.back()
          }
        })
    }
  }
}

export default ReportCard
