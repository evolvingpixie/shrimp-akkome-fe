import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronDown
)

export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: [
    'value',
    'disabled',
    'unstyled',
    'kind'
  ]
}
