import Importer from 'src/components/importer/importer.vue'
import Exporter from 'src/components/exporter/exporter.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import { mapState } from 'vuex'

const DataImportExportTab = {
  data () {
    return {
      activeTab: 'profile',
      newDomainToMute: '',
      listBackupsError: false,
      addBackupError: false,
      addedBackup: false,
      backups: []
    }
  },
  created () {
    this.$store.dispatch('fetchTokens')
    this.fetchBackups()
  },
  components: {
    Importer,
    Exporter,
    Checkbox
  },
  computed: {
    ...mapState({
      backendInteractor: (state) => state.api.backendInteractor,
      user: (state) => state.users.currentUser
    })
  },
  methods: {
    getFollowsContent () {
      return this.backendInteractor.exportFriends({ id: this.user.id })
        .then(this.generateExportableUsersContent)
    },
    getBlocksContent () {
      return this.backendInteractor.fetchBlocks()
        .then(this.generateExportableUsersContent)
    },
    getMutesContent () {
      return this.backendInteractor.fetchMutes()
        .then(this.generateExportableUsersContent)
    },
    importFollows (file) {
      return this.backendInteractor.importFollows({ file })
        .then((status) => {
          if (!status) {
            throw new Error('failed')
          }
        })
    },
    importBlocks (file) {
      return this.backendInteractor.importBlocks({ file })
        .then((status) => {
          if (!status) {
            throw new Error('failed')
          }
        })
    },
    importMutes (file) {
      return this.backendInteractor.importMutes({ file })
        .then((status) => {
          if (!status) {
            throw new Error('failed')
          }
        })
    },
    generateExportableUsersContent (users) {
      // Get addresses
      return users.map((user) => {
        // check is it's a local user
        if (user && user.is_local) {
          // append the instance address
           
          return user.screen_name + '@' + location.hostname
        }
        return user.screen_name
      }).join('\n')
    },
    addBackup () {
      this.$store.state.api.backendInteractor.addBackup()
        .then((res) => {
          this.addedBackup = true
          this.addBackupError = false
        })
        .catch((error) => {
          this.addedBackup = false
          this.addBackupError = error
        })
        .then(() => this.fetchBackups())
    },
    fetchBackups () {
      this.$store.state.api.backendInteractor.listBackups()
        .then((res) => {
          this.backups = res
          this.listBackupsError = false
        })
        .catch((error) => {
          this.listBackupsError = error.error
        })
    }
  }
}

export default DataImportExportTab
