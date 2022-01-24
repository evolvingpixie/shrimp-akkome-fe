<template>
  <div
    v-if="federationPolicy"
    class="mrf-transparency-panel"
  >
    <div class="panel panel-default base01-background">
      <div class="panel-heading timeline-heading base02-background">
        <div class="title">
          {{ $t("about.mrf.federation") }}
        </div>
      </div>
      <div class="panel-body">
        <div class="mrf-section">
          <h2>{{ $t("about.mrf.mrf_policies") }}</h2>
          <p>{{ $t("about.mrf.mrf_policies_desc") }}</p>

          <ul>
            <li
              v-for="policy in mrfPolicies"
              :key="policy"
              v-text="policy"
            />
          </ul>

          <h2 v-if="hasInstanceSpecificPolicies">
            {{ $t("about.mrf.simple.simple_policies") }}
          </h2>

          <div v-if="acceptInstances.length">
            <h4>{{ $t("about.mrf.simple.accept") }}</h4>

            <p>{{ $t("about.mrf.simple.accept_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in acceptInstances"
                :key="entry.instance + '_accept'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <div v-if="rejectInstances.length">
            <h4>{{ $t("about.mrf.simple.reject") }}</h4>

            <p>{{ $t("about.mrf.simple.reject_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in rejectInstances"
                :key="entry.instance + '_reject'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <div v-if="quarantineInstances.length">
            <h4>{{ $t("about.mrf.simple.quarantine") }}</h4>

            <p>{{ $t("about.mrf.simple.quarantine_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in quarantineInstances"
                :key="entry.instance + '_quarantine'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <div v-if="ftlRemovalInstances.length">
            <h4>{{ $t("about.mrf.simple.ftl_removal") }}</h4>

            <p>{{ $t("about.mrf.simple.ftl_removal_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in ftlRemovalInstances"
                :key="entry.instance + '_ftl_removal'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <div v-if="mediaNsfwInstances.length">
            <h4>{{ $t("about.mrf.simple.media_nsfw") }}</h4>

            <p>{{ $t("about.mrf.simple.media_nsfw_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in mediaNsfwInstances"
                :key="entry.instance + '_media_nsfw'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <div v-if="mediaRemovalInstances.length">
            <h4>{{ $t("about.mrf.simple.media_removal") }}</h4>

            <p>{{ $t("about.mrf.simple.media_removal_desc") }}</p>

            <table>
              <tr>
                <th>{{ $t("about.mrf.simple.instance") }}</th>
                <th>{{ $t("about.mrf.simple.reason") }}</th>
              </tr>
              <tr
                v-for="entry in mediaRemovalInstances"
                :key="entry.instance + '_media_removal'"
              >
                <td>{{ entry.instance }}</td>
                <td v-if="entry.reason === ''">
                  {{ $t("about.mrf.simple.not_applicable") }}
                </td>
                <td v-else>
                  {{ entry.reason }}
                </td>
              </tr>
            </table>
          </div>

          <h2 v-if="hasKeywordPolicies">
            {{ $t("about.mrf.keyword.keyword_policies") }}
          </h2>

          <div v-if="keywordsFtlRemoval.length">
            <h4>{{ $t("about.mrf.keyword.ftl_removal") }}</h4>

            <ul>
              <li
                v-for="keyword in keywordsFtlRemoval"
                :key="keyword"
                v-text="keyword"
              />
            </ul>
          </div>

          <div v-if="keywordsReject.length">
            <h4>{{ $t("about.mrf.keyword.reject") }}</h4>

            <ul>
              <li
                v-for="keyword in keywordsReject"
                :key="keyword"
                v-text="keyword"
              />
            </ul>
          </div>

          <div v-if="keywordsReplace.length">
            <h4>{{ $t("about.mrf.keyword.replace") }}</h4>

            <ul>
              <li
                v-for="keyword in keywordsReplace"
                :key="keyword"
              >
                {{ keyword.pattern }}
                {{ $t("about.mrf.keyword.is_replaced_by") }}
                {{ keyword.replacement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./mrf_transparency_panel.js"></script>

<style lang="scss">
@import '../../_variables.scss';
@import './mrf_transparency_panel.scss';
</style>
