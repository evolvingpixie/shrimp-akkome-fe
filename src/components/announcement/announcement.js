import { mapState } from 'vuex'
import AnnouncementEditor from '../announcement_editor/announcement_editor.vue'
import RichContent from '../rich_content/rich_content.jsx'
import localeService from '../../services/locale/locale.service.js'

const Announcement = {
  components: {
    AnnouncementEditor,
    RichContent
  },
  data () {
    return {
      editing: false,
      editedAnnouncement: {
        content: '',
        startsAt: undefined,
        endsAt: undefined,
        allDay: undefined
      },
      editError: ''
    }
  },
  props: {
    announcement: Object
  },
  computed: {
    ...mapState({
      currentUser: state => state.users.currentUser
    }),
    content () {
      return this.announcement.content
    },
    isRead () {
      return this.announcement.read
    },
    publishedAt () {
      const time = this.announcement['published_at']
      if (!time) {
        return
      }

      return this.formatTimeOrDate(time, localeService.internalToBrowserLocale(this.$i18n.locale))
    },
    startsAt () {
      const time = this.announcement['starts_at']
      if (!time) {
        return
      }

      return this.formatTimeOrDate(time, localeService.internalToBrowserLocale(this.$i18n.locale))
    },
    endsAt () {
      const time = this.announcement['ends_at']
      if (!time) {
        return
      }

      return this.formatTimeOrDate(time, localeService.internalToBrowserLocale(this.$i18n.locale))
    },
    inactive () {
      return this.announcement.inactive
    }
  },
  methods: {
    markAsRead () {
      if (!this.isRead) {
        return this.$store.dispatch('markAnnouncementAsRead', this.announcement.id)
      }
    },
    deleteAnnouncement () {
      return this.$store.dispatch('deleteAnnouncement', this.announcement.id)
    },
    formatTimeOrDate (time, locale) {
      const d = new Date(time)
      return this.announcement['all_day'] ? d.toLocaleDateString(locale) : d.toLocaleString(locale)
    },
    enterEditMode () {
      this.editedAnnouncement.content = this.announcement.pleroma['raw_content']
      this.editedAnnouncement.startsAt = this.announcement['starts_at']
      this.editedAnnouncement.endsAt = this.announcement['ends_at']
      this.editedAnnouncement.allDay = this.announcement['all_day']
      this.editing = true
    },
    submitEdit () {
      this.$store.dispatch('editAnnouncement', {
        id: this.announcement.id,
        ...this.editedAnnouncement
      })
        .then(() => {
          this.editing = false
        })
        .catch(error => {
          this.editError = error.error
        })
    },
    cancelEdit () {
      this.editing = false
    },
    clearError () {
      this.editError = undefined
    }
  }
}

export default Announcement
