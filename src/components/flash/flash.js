import RuffleService from '../../services/ruffle_service/ruffle_service.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faStop,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faStop,
  faExclamationTriangle
)

const Flash = {
  props: [ 'src' ],
  data () {
    return {
      player: false, // can be true, "hidden", false. hidden = element exists
      loaded: false,
      ruffleInstance: null
    }
  },
  methods: {
    openPlayer () {
      if (this.player) return // prevent double-loading, or re-loading on failure
      this.player = 'hidden'
      RuffleService.getRuffle().then((ruffle) => {
        const player = ruffle.newest().createPlayer()
        player.config = {
          letterbox: 'on'
        }
        const container = this.$refs.container
        container.appendChild(player)
        player.style.width = '100%'
        player.style.height = '100%'
        player.load(this.src).then(() => {
          this.player = true
        }).catch((e) => {
          console.error('Error loading ruffle', e)
          this.player = 'error'
        })
        this.ruffleInstance = player
        this.$emit('playerOpened')
      })
    },
    closePlayer () {
      this.ruffleInstance && this.ruffleInstance.remove()
      this.player = false
      this.$emit('playerClosed')
    }
  }
}

export default Flash
