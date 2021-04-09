const Flash = {
  props: [
    'src'
  ],
  created: function () {
    this.$nextTick(function () {
      const ruffle = window.RufflePlayer.newest()
      const player = ruffle.createPlayer()
      const container = this.$refs.cunt
      container.appendChild(player)
      player.load(this.src)
    })
  }
}

export default Flash
