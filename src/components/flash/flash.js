import RuffleService from '../../services/ruffle_service/ruffle_service.js'

const Flash = {
  props: [ 'src' ],
  created () {
    this.$nextTick(function () {
      RuffleService.getRuffle().then((ruffle) => {
        const player = ruffle.newest().createPlayer()
        const container = this.$refs.cunt
        container.appendChild(player)
        player.load(this.src)
      })
    })
  }
}

export default Flash
