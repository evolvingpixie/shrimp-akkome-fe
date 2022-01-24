import { mapState } from 'vuex'
import { get } from 'lodash'

/**
 * This is for backwards compatibility. We originally didn't recieve
 * extra info like a reason why an instance was rejected/quarantined/etc.
 * Because we didn't want to break backwards compatibility it was decided
 * to add an extra "info" key.
 */
const toInstanceReasonObject = (instances, info, key) => {
  return instances.map(instance => {
    if (info[key] && info[key][instance] && info[key][instance]['reason']) {
      return { instance: instance, reason: info[key][instance]['reason'] }
    }
    return { instance: instance, reason: '' }
  })
}

const MRFTransparencyPanel = {
  computed: {
    ...mapState({
      federationPolicy: state => get(state, 'instance.federationPolicy'),
      mrfPolicies: state => get(state, 'instance.federationPolicy.mrf_policies', []),
      quarantineInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.quarantined_instances', []),
        get(state, 'instance.federationPolicy.quarantined_instances_info', []),
        'quarantined_instances'
      ),
      acceptInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.mrf_simple.accept', []),
        get(state, 'instance.federationPolicy.mrf_simple_info', []),
        'accept'
      ),
      rejectInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.mrf_simple.reject', []),
        get(state, 'instance.federationPolicy.mrf_simple_info', []),
        'reject'
      ),
      ftlRemovalInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.mrf_simple.federated_timeline_removal', []),
        get(state, 'instance.federationPolicy.mrf_simple_info', []),
        'federated_timeline_removal'
      ),
      mediaNsfwInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.mrf_simple.media_nsfw', []),
        get(state, 'instance.federationPolicy.mrf_simple_info', []),
        'media_nsfw'
      ),
      mediaRemovalInstances: state => toInstanceReasonObject(
        get(state, 'instance.federationPolicy.mrf_simple.media_removal', []),
        get(state, 'instance.federationPolicy.mrf_simple_info', []),
        'media_removal'
      ),
      keywordsFtlRemoval: state => get(state, 'instance.federationPolicy.mrf_keyword.federated_timeline_removal', []),
      keywordsReject: state => get(state, 'instance.federationPolicy.mrf_keyword.reject', []),
      keywordsReplace: state => get(state, 'instance.federationPolicy.mrf_keyword.replace', [])
    }),
    hasInstanceSpecificPolicies () {
      return this.quarantineInstances.length ||
        this.acceptInstances.length ||
        this.rejectInstances.length ||
        this.ftlRemovalInstances.length ||
        this.mediaNsfwInstances.length ||
        this.mediaRemovalInstances.length
    },
    hasKeywordPolicies () {
      return this.keywordsFtlRemoval.length ||
        this.keywordsReject.length ||
        this.keywordsReplace.length
    }
  }
}

export default MRFTransparencyPanel
