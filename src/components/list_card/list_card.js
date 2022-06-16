import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEllipsisH
)

const ListCard = {
  props: [
    'list'
  ],
  methods: {
    listLink (id) {
      return '/lists/' + id
    }
  }
}

export default ListCard
