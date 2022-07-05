import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import Checkbox from '../checkbox/checkbox.vue'

library.add(
  faSearch,
  faChevronLeft
)

const ListUserSearch = {
  components: {
    Checkbox
  },
  data () {
    return {
      loading: false,
      query: '',
      followingOnly: true
    }
  },
  methods: {
    onInput: debounce(function () {
      this.search(this.query)
    }, 2000),
    search (query) {
      if (!query) {
        this.loading = false
        return
      }

      this.loading = true
      this.userIds = []
      this.$store.dispatch('search', { q: query, resolve: true, type: 'accounts', following: this.followingOnly })
        .then(data => {
          this.loading = false
          this.$emit('results', data.accounts.map(a => a.id))
        })
    }
  }
}

export default ListUserSearch
