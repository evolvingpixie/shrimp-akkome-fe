import { defineAsyncComponent } from 'vue'
import Checkbox from '../checkbox/checkbox.vue'
import EmojiGrid from '../emoji_grid/emoji_grid.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBoxOpen,
  faStickyNote,
  faSmileBeam
} from '@fortawesome/free-solid-svg-icons'
import { trim, escapeRegExp, startCase, debounce } from 'lodash'

library.add(
  faBoxOpen,
  faStickyNote,
  faSmileBeam
)

const EmojiPicker = {
  props: {
    enableStickerPicker: {
      required: false,
      type: Boolean,
      default: false
    },
    showKeepOpen: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      keyword: '',
      activeGroup: 'standard',
      showingStickers: false,
      keepOpen: false
    }
  },
  components: {
    StickerPicker: defineAsyncComponent(() => import('../sticker_picker/sticker_picker.vue')),
    Checkbox,
    EmojiGrid
  },
  methods: {
    debouncedSearch: debounce(function (e) {
      this.keyword = e.target.value
    }, 500),
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-failed', e)
    },
    onEmoji (emoji) {
      const value = emoji.imageUrl ? `:${emoji.displayText}:` : emoji.replacement
      this.$emit('emoji', { insertion: value, keepOpen: this.keepOpen })
      this.$store.commit('emojiUsed', emoji)
    },
    onWheel (e) {
      e.preventDefault()
      this.$refs['emoji-tabs'].scrollBy(e.deltaY, 0)
    },
    highlight (key) {
      this.setShowStickers(false)
      this.activeGroup = key
      if (this.keyword.length) {
        this.$refs.emojiGrid.scrollToItem(key)
      }
    },
    onActiveGroup (group) {
      this.activeGroup = group
    },
    toggleStickers () {
      this.showingStickers = !this.showingStickers
    },
    setShowStickers (value) {
      this.showingStickers = value
    },
    filterByKeyword (list) {
      if (this.keyword === '') return list
      const regex = new RegExp(escapeRegExp(trim(this.keyword)), 'i')
      return list.filter(emoji => {
        return (regex.test(emoji.displayText) || (!emoji.imageUrl && emoji.replacement === this.keyword))
      })
    }
  },
  computed: {
    activeGroupView () {
      return this.showingStickers ? '' : this.activeGroup
    },
    emojis () {
      const recentEmojis = this.$store.getters.recentEmojis
      const standardEmojis = this.$store.state.instance.emoji || []
      const customEmojis = this.sortedEmoji
      const emojiPacks = []
      customEmojis.forEach((pack, id) => {
        emojiPacks.push({
          id: id.replace(/^pack:/, ''),
          text: startCase(id.replace(/^pack:/, '')),
          first: pack[0],
          emojis: this.filterByKeyword(pack)
        })
      })
      return [
        {
          id: 'recent',
          text: this.$t('emoji.recent'),
          first: {
            imageUrl: '',
            replacement: '🕒',
          },
          emojis: this.filterByKeyword(recentEmojis)
        },
        {
          id: 'standard',
          text: this.$t('emoji.unicode'),
          first: {
            imageUrl: '',
            replacement: '🥴'
          },
          emojis: this.filterByKeyword(standardEmojis)
        }
      ].concat(emojiPacks)
    },
    sortedEmoji () {
      const customEmojis = this.$store.state.instance.customEmoji || []
      const sortedEmojiGroups = new Map()
      customEmojis.forEach((emoji) => {
        if (!sortedEmojiGroups.has(emoji.tags[0])) {
          sortedEmojiGroups.set(emoji.tags[0], [emoji])
        } else {
          sortedEmojiGroups.get(emoji.tags[0]).push(emoji)
        }
      })
      return new Map([...sortedEmojiGroups.entries()].sort())
    },
    emojisView () {
      if (this.keyword === '') {
        return this.emojis.filter(pack => {
          return pack.id === this.activeGroup
        })
      } else {
        return this.emojis.filter(pack => {
          return pack.emojis.length > 0
        })
      }
    },
    stickerPickerEnabled () {
      return (this.$store.state.instance.stickers || []).length !== 0 && this.enableStickerPicker
    }
  }
}

export default EmojiPicker
