import ConfirmModal from 'src/components/confirm_modal/confirm_modal.vue'
import Timeago from 'src/components/timeago/timeago.vue'
import UserAvatar from 'src/components/user_avatar/user_avatar.vue'

const ReportNote = {
  data () {
    return {
      showingDeleteDialog: false
    }
  },
  props: [
    'content',
    'created_at',
    'user',
    'report_id',
    'id'
  ],
  components: {
    ConfirmModal,
    Timeago,
    UserAvatar
  },
  methods: {
    deleteNoteFromReport () {
      this.$store.dispatch('deleteNoteFromReport', { id: this.report_id, note: this.id })
      this.showingDeleteDialog = false
    },
    showDeleteDialog () {
      this.showingDeleteDialog = true
    },
    hideDeleteDialog () {
      this.showingDeleteDialog = false
    }
  }
}

export default ReportNote
