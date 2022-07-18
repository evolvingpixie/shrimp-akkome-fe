import Checkbox from '../checkbox/checkbox.vue'

const AnnouncementEditor = {
  components: {
    Checkbox
  },
  props: {
    announcement: Object,
    disabled: Boolean
  }
}

export default AnnouncementEditor
