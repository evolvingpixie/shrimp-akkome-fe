import Status from '../status/status.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDoubleDown,
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faAngleDoubleDown,
  faAngleDoubleRight
)

const ThreadTree = {
  components: {
    Status
  },
  name: 'ThreadTree',
  props: {
    depth: Number,
    status: Object,
    inProfile: Boolean,
    conversation: Array,
    collapsable: Boolean,
    isExpanded: Boolean,
    pinnedStatusIdsObject: Object,
    profileUserId: String,

    focused: Function,
    highlight: String,
    getReplies: Function,
    setHighlight: Function,
    toggleExpanded: Function,

    simple: Boolean,
    // to control display of the whole thread forest
    toggleThreadDisplay: Function,
    threadDisplayStatus: Object,
    showThreadRecursively: Function,
    totalReplyCount: Object,
    totalReplyDepth: Object,
    statusContentProperties: Object,
    setStatusContentProperty: Function,
    toggleStatusContentProperty: Function,
    dive: Function
  },
  computed: {
    suspendable () {
      const selfSuspendable = this.$refs.statusComponent ? this.$refs.statusComponent.suspendable : true
      if (this.$refs.childComponent) {
        return selfSuspendable && this.$refs.childComponent.every(s => s.suspendable)
      }
      return selfSuspendable
    },
    reverseLookupTable () {
      return this.conversation.reduce((table, status, index) => {
        table[status.id] = index
        return table
      }, {})
    },
    currentReplies () {
      return this.getReplies(this.status.id).map(({ id }) => this.statusById(id))
    },
    threadShowing () {
      return this.threadDisplayStatus[this.status.id] === 'showing'
    },
    currentProp () {
      return this.statusContentProperties[this.status.id]
    }
  },
  methods: {
    statusById (id) {
      return this.conversation[this.reverseLookupTable[id]]
    },
    collapseThread () {
    },
    showThread () {
    },
    showAllSubthreads () {
    },
    toggleCurrentProp (name) {
      this.toggleStatusContentProperty(this.status.id, name)
    },
    setCurrentProp (name, newVal) {
      this.setStatusContentProperty(this.status.id, name)
    }
  }
}

export default ThreadTree
