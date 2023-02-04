const EMOJI_SIZE = 32 + 8
const GROUP_TITLE_HEIGHT = 24
const BUFFER_SIZE = 3 * EMOJI_SIZE

const EmojiGrid = {
  props: {
    groups: {
      required: true,
      type: Array
    }
  },
  data () {
    return {
      containerWidth: 0,
      containerHeight: 0,
      scrollPos: 0,
      resizeObserver: null
    }
  },
  mounted () {
    const rect = this.$refs.container.getBoundingClientRect()
    this.containerWidth = rect.width
    this.containerHeight = rect.height
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.containerWidth = entry.contentRect.width
        this.containerHeight = entry.contentRect.height
      }
    })
    this.resizeObserver.observe(this.$refs.container)
  },
  beforeUnmount () {
    this.resizeObserver.disconnect()
    this.resizeObserver = null
  },
  watch: {
    groups () {
      // Scroll to top when grid content changes
      if (this.$refs.container) {
        this.$refs.container.scrollTo(0, 0)
      }
    },
    activeGroup (group) {
      this.$emit('activeGroup', group)
    }
  },
  methods: {
    onScroll () {
      this.scrollPos = this.$refs.container.scrollTop
    },
    onEmoji (emoji) {
      this.$emit('emoji', emoji)
    },
    scrollToItem (itemId) {
      const container = this.$refs.container
      if (!container) return

      for (const item of this.itemList) {
        if (item.id === itemId) {
          container.scrollTo(0, item.position.y)
          return
        }
      }
    }
  },
  computed: {
    // Total height of scroller content
    gridHeight () {
      if (this.itemList.length === 0) return 0
      const lastItem = this.itemList[this.itemList.length - 1]
      return (
        lastItem.position.y +
        ('title' in lastItem ? GROUP_TITLE_HEIGHT : EMOJI_SIZE)
      )
    },
    activeGroup () {
      const items = this.itemList
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]
        if ('title' in item && item.position.y <= this.scrollPos) {
          return item.id
        }
      }
      return null
    },
    itemList () {
      const items = []
      let x = 0
      let y = 0
      for (const group of this.groups) {
        items.push({ position: { x, y }, id: group.id, title: group.text })
        if (group.text.length) {
          y += GROUP_TITLE_HEIGHT
        }
        for (const emoji of group.emojis) {
          items.push({
            position: { x, y },
            id: `${group.id}-${emoji.displayText}`,
            emoji
          })
          x += EMOJI_SIZE
          if (x + EMOJI_SIZE > this.containerWidth) {
            y += EMOJI_SIZE
            x = 0
          }
        }
        if (x > 0) {
          y += EMOJI_SIZE
          x = 0
        }
      }
      return items
    },
    visibleItems () {
      const startPos = this.scrollPos - BUFFER_SIZE
      const endPos = this.scrollPos + this.containerHeight + BUFFER_SIZE
      return this.itemList.filter((i) => {
        return i.position.y >= startPos && i.position.y < endPos
      })
    },
    scrolledClass () {
      if (this.scrollPos <= 5) {
        return 'scrolled-top'
      } else if (this.scrollPos >= this.gridHeight - this.containerHeight - 5) {
        return 'scrolled-bottom'
      } else {
        return 'scrolled-middle'
      }
    }
  }
}

export default EmojiGrid
