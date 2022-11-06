import { filter, find, forEach, remove } from 'lodash'

const getReport = (state, id) => find(state.reports, { id })
const updateReport = (state, { report, param, value }) => {
  getReport(state, report.id)[param] = value
}

const reports = {
  state: {
    userId: null,
    statuses: [],
    preTickedIds: [],
    modalActivated: false,
    reports: []
  },
  mutations: {
    openUserReportingModal (state, { userId, statuses, preTickedIds }) {
      state.userId = userId
      state.statuses = statuses
      state.preTickedIds = preTickedIds
      state.modalActivated = true
    },
    closeUserReportingModal (state) {
      state.modalActivated = false
    },
    setReport (state, { report }) {
      let existing = getReport(state, report.id)
      if (existing) {
        existing = report
      } else {
        state.reports.push(report)
      }
    },
    updateReportStates (state, { reports }) {
      forEach(reports, (report) => {
        updateReport(state, { report, param: 'state', value: report.state })
      })
    },
    addNoteToReport (state, { id, note, user }) {
      // akkoma doesn't return the note from this API endpoint, and there's no
      // good way to get it. the note data is spoofed in the frontend until
      // reload.
      // definitely worth adding this to the backend at some point
      const report = getReport(state, id)
      const date = new Date()

      report.notes.push({
        content: note,
        user,
        created_at: date.toISOString(),
        id: date.getTime()
      })
    },
    deleteNoteFromReport (state, { id, note }) {
      const report = getReport(state, id)
      remove(report.notes, { id: note })
    }
  },
  actions: {
    openUserReportingModal ({ rootState, commit }, { userId, statusIds = [] }) {
      const preTickedStatuses = statusIds.map(id => rootState.statuses.allStatusesObject[id])
      const preTickedIds = statusIds
      const statuses = preTickedStatuses.concat(
        filter(rootState.statuses.allStatuses,
          status => status.user.id === userId && !preTickedIds.includes(status.id)
        )
      )
      commit('openUserReportingModal', { userId, statuses, preTickedIds })
    },
    closeUserReportingModal ({ commit }) {
      commit('closeUserReportingModal')
    },
    updateReportStates ({ rootState, commit }, { reports }) {
      commit('updateReportStates', { reports })
      return rootState.api.backendInteractor.updateReportStates({ reports })
    },
    getReport ({ rootState, commit }, { id }) {
      return rootState.api.backendInteractor.getReport({ id })
        .then(report => commit('setReport', { report }))
    },
    addNoteToReport ({ rootState, commit }, { id, note }) {
      commit('addNoteToReport', { id, note, user: rootState.users.currentUser })
      return rootState.api.backendInteractor.addNoteToReport({ id, note })
    },
    deleteNoteFromReport ({ rootState, commit }, { id, note }) {
      commit('deleteNoteFromReport', { id, note })
      return rootState.api.backendInteractor.deleteNoteFromReport({ id, note })
    }
  }
}

export default reports
