import DialogModal from '../dialog_modal/dialog_modal.vue'

/**
 * This component emits the following events:
 * cancelled, emitted when the action should not be performed;
 * accepted, emitted when the action should be performed;
 *
 * The caller should close this dialog after receiving any of the two events.
 */
const ConfirmModal = {
  components: {
    DialogModal
  },
  props: {
    title: {
      type: String
    },
    cancelText: {
      type: String
    },
    confirmText: {
      type: String
    }
  },
  computed: {
  },
  methods: {
    onCancel () {
      this.$emit('cancelled')
    },
    onAccept () {
      this.$emit('accepted')
    }
  }
}

export default ConfirmModal
