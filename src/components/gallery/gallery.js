import Attachment from '../attachment/attachment.vue'
import { sumBy } from 'lodash'

const Gallery = {
  props: [
    'attachments',
    'nsfw',
    'setMedia',
    'size'
  ],
  data () {
    return {
      sizes: {},
      hidingLong: true
    }
  },
  components: { Attachment },
  computed: {
    rows () {
      if (!this.attachments) {
        return []
      }
      console.log(this.size)
      if (this.size === 'hide') {
        return this.attachments.map(item => ({ minimal: true, items: [item] }))
      }
      const rows = this.attachments.reduce((acc, attachment, i) => {
        if (attachment.mimetype.includes('audio')) {
          return [...acc, { audio: true, items: [attachment] }, { items: [] }]
        }
        const maxPerRow = 3
        const attachmentsRemaining = this.attachments.length - i - 1
        const currentRow = acc[acc.length - 1].items
        if (
          currentRow.length <= maxPerRow ||
            attachmentsRemaining === 1
        ) {
          currentRow.push(attachment)
        }
        if (currentRow.length === maxPerRow && attachmentsRemaining > 1) {
          return [...acc, { items: [] }]
        } else {
          return acc
        }
      }, [{ items: [] }]).filter(_ => _.items.length > 0)
      return rows
    },
    attachmentsDimensionalScore () {
      return this.rows.reduce((acc, row) => {
        return acc + (row.audio ? 0.25 : (1 / (row.items.length + 0.6)))
      }, 0)
    },
    tooManyAttachments () {
      if (this.size === 'hide') {
        return this.attachments.length > 8
      } else {
        return this.attachmentsDimensionalScore > 1
      }
    }
  },
  methods: {
    onNaturalSizeLoad (id, size) {
      this.$set(this.sizes, id, size)
    },
    rowStyle (row) {
      if (row.audio) {
        return { 'padding-bottom': '25%' } // fixed reduced height for audio
      } else if (!row.minimal) {
        return { 'padding-bottom': `${(100 / (row.items.length + 0.6))}%` }
      }
    },
    itemStyle (id, row) {
      const total = sumBy(row, item => this.getAspectRatio(item.id))
      return { flex: `${this.getAspectRatio(id) / total} 1 0%` }
    },
    getAspectRatio (id) {
      const size = this.sizes[id]
      return size ? size.width / size.height : 1
    },
    toggleHidingLong (event) {
      this.hidingLong = event
    },
    openGallery () {
      this.setMedia()
      this.$store.dispatch('setCurrent', this.attachments[0])
    }
  }
}

export default Gallery
