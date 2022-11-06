import apiService from '../api/api.service.js'
import { promiseInterval } from '../promise_interval/promise_interval.js'
import { forEach } from 'lodash'

const fetchAndUpdate = ({ store, credentials, state, limit, page, pageSize }) => {
  return apiService.getReports({ credentials, state, limit, page, pageSize })
    .then(reports => forEach(reports, report => store.commit('setReport', { report })))
}

const startFetching = ({ store, credentials, state, limit, page, pageSize }) => {
  const boundFetchAndUpdate = () => fetchAndUpdate({ store, credentials, state, limit, page, pageSize })
  boundFetchAndUpdate()
  return promiseInterval(boundFetchAndUpdate, 60000)
}

const reportsFetcher = {
  startFetching
}

export default reportsFetcher
