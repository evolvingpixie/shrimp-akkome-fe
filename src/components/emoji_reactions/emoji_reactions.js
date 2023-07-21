import UserAvatar from '../user_avatar/user_avatar.vue'
import UserListPopover from '../user_list_popover/user_list_popover.vue'
import StillImage from '../still-image/still-image.vue'

const EMOJI_REACTION_COUNT_CUTOFF = 12

const findEmojiByReplacement = (state, replacement) => {
  const allEmojis = state.instance.emoji.concat(state.instance.customEmoji)
  return allEmojis.find(emoji => emoji.replacement === replacement)
}

const EmojiReactions = {
  name: 'EmojiReactions',
  components: {
    UserAvatar,
    UserListPopover,
    StillImage
  },
  props: ['status'],
  data: () => ({
    showAll: false
  }),
  computed: {
    tooManyReactions () {
      return this.status.emoji_reactions.length > EMOJI_REACTION_COUNT_CUTOFF
    },
    emojiReactions () {
      return this.showAll
        ? this.status.emoji_reactions
        : this.status.emoji_reactions.slice(0, EMOJI_REACTION_COUNT_CUTOFF)
    },
    showMoreString () {
      return `+${this.status.emoji_reactions.length - EMOJI_REACTION_COUNT_CUTOFF}`
    },
    accountsForEmoji () {
      return this.status.emoji_reactions.reduce((acc, reaction) => {
        if (reaction.url) {
          acc[reaction.url] = reaction.accounts || []
        } else {
          acc[reaction.name] = reaction.accounts || []
        }
        return acc
      }, {})
    },
    loggedIn () {
      return !!this.$store.state.users.currentUser
    }
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    reactedWith (emoji) {
      return this.status.emoji_reactions.find(r => r.name === emoji).me
    },
    fetchEmojiReactionsByIfMissing () {
      const hasNoAccounts = this.status.emoji_reactions.find(r => !r.accounts)
      if (hasNoAccounts) {
        this.$store.dispatch('fetchEmojiReactionsBy', this.status.id)
      }
    },
    reactWith (emoji) {
      this.$store.dispatch('reactWithEmoji', { id: this.status.id, emoji })
      const emojiObject = findEmojiByReplacement(this.$store.state, emoji)
      this.$store.commit('emojiUsed', emojiObject)
    },
    unreact (emoji) {
      this.$store.dispatch('unreactWithEmoji', { id: this.status.id, emoji })
    },
    emojiOnClick (emoji, event) {
      if (!this.loggedIn) return

      if (this.reactedWith(emoji)) {
        this.unreact(emoji)
      } else {
        this.reactWith(emoji)
      }
    }
  }
}

export default EmojiReactions
