export default {
  props: [ 'user' ],
  computed: {
    subscribeUrl () {
       
      const serverUrl = new URL(this.user.statusnet_profile_url)
      return `${serverUrl.protocol}//${serverUrl.host}/main/ostatus`
    }
  }
}
