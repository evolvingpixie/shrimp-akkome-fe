import { filter } from 'lodash'

import ReportCard from './report_card.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'

const ReportsTab = {
  data () {
    return {
      showClosed: false
    }
  },
  components: {
    Checkbox,
    ReportCard
  },
  computed: {
    reports () {
      return this.$store.state.reports.reports
    },
    openReports () {
      return filter(this.reports, { state: 'open' })
    }
  }
}

export default ReportsTab
