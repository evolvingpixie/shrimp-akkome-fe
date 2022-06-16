import Popover from '../popover/popover.vue'
import EmojiPicker from '../emoji_picker/emoji_picker.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSmileBeam } from '@fortawesome/free-regular-svg-icons'

library.add(faSmileBeam)

const ReactButton = {
  props: ['status'],
  data () {
    return {
      filterWord: ''
    }
  },
  components: {
    Popover,
    EmojiPicker
  },
  methods: {
    addReaction (event, close) {
      const emoji = event.insertion
      const existingReaction = this.status.emoji_reactions.find(r => r.name === emoji)
      if (existingReaction && existingReaction.me) {
        this.$store.dispatch('unreactWithEmoji', { id: this.status.id, emoji })
      } else {
        this.$store.dispatch('reactWithEmoji', { id: this.status.id, emoji })
      }
      close()
    },
    focusInput () {
      this.$nextTick(() => {
        const input = this.$el.querySelector('input')
        if (input) input.focus()
      })
    }
  },
  computed: {
    mergedConfig () {
      return this.$store.getters.mergedConfig
    }
  }
}

export default ReactButton
