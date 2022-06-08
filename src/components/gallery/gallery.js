import Attachment from '../attachment/attachment.vue'
import { sumBy, set } from 'lodash'

const Gallery = {
  props: [
    'attachments',
    'limitRows',
    'descriptions',
    'limit',
    'nsfw',
    'setMedia',
    'size',
    'editable',
    'removeAttachment',
    'shiftUpAttachment',
    'shiftDnAttachment',
    'editAttachment',
    'grid'
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
      const attachments = this.limit > 0
        ? this.attachments.slice(0, this.limit)
        : this.attachments
      if (this.size === 'hide') {
        return attachments.map(item => ({ minimal: true, items: [item] }))
      }
      const rows = this.grid
        ? [{ grid: true, items: attachments }]
        : attachments.reduce((acc, attachment, i) => {
          if (attachment.mimetype.includes('audio')) {
            return [...acc, { audio: true, items: [attachment] }, { items: [] }]
          }
          if (!(
            attachment.mimetype.includes('image') ||
              attachment.mimetype.includes('video') ||
              attachment.mimetype.includes('flash')
          )) {
            return [...acc, { minimal: true, items: [attachment] }, { items: [] }]
          }
          const maxPerRow = 3
          const attachmentsRemaining = this.attachments.length - i + 1
          const currentRow = acc[acc.length - 1].items
          currentRow.push(attachment)
          if (currentRow.length >= maxPerRow && attachmentsRemaining > maxPerRow) {
            return [...acc, { items: [] }]
          } else {
            return acc
          }
        }, [{ items: [] }]).filter(_ => _.items.length > 0)
      return rows
    },
    attachmentsDimensionalScore () {
      return this.rows.reduce((acc, row) => {
        let size = 0
        if (row.minimal) {
          size += 1 / 8
        } else if (row.audio) {
          size += 1 / 4
        } else {
          size += 1 / (row.items.length + 0.6)
        }
        return acc + size
      }, 0)
    },
    tooManyAttachments () {
      if (this.editable || this.size === 'small') {
        return false
      } else if (this.size === 'hide') {
        return this.attachments.length > 8
      } else {
        return this.attachmentsDimensionalScore > 1
      }
    }
  },
  methods: {
    onNaturalSizeLoad ({ id, width, height }) {
      set(this.sizes, id, { width, height })
    },
    rowStyle (row) {
      if (row.audio) {
        return { 'padding-bottom': '25%' } // fixed reduced height for audio
      } else if (!row.minimal && !row.grid) {
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
      this.$store.dispatch('setMedia', this.attachments)
      this.$store.dispatch('setCurrentMedia', this.attachments[0])
    },
    onMedia () {
      this.$store.dispatch('setMedia', this.attachments)
    }
  }
}

export default Gallery
