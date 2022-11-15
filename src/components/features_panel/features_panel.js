import fileSizeFormatService from '../../services/file_size_format/file_size_format.js'

const FeaturesPanel = {
  computed: {
    whoToFollow: function () { return this.$store.state.instance.suggestionsEnabled },
    mediaProxy: function () { return this.$store.state.instance.mediaProxyAvailable },
    textlimit: function () { return this.$store.state.instance.textlimit },
    uploadlimit: function () { return fileSizeFormatService.fileSizeFormat(this.$store.state.instance.uploadlimit) }
  }
}

export default FeaturesPanel
