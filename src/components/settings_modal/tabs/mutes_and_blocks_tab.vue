<template>
  <tab-switcher
    :scrollable-tabs="true"
    class="mutes-and-blocks-tab"
  >
    <div :label="$t('settings.blocks_tab')">
      <div class="usersearch-wrapper">
        <Autosuggest
          :filter="filterUnblockedUsers"
          :query="queryUserIds"
          :placeholder="$t('settings.search_user_to_block')"
        >
          <template #default="row">
            <BlockCard
              :user-id="row.item"
            />
          </template>
        </Autosuggest>
      </div>
      <BlockList
        :refresh="true"
        :get-key="i => i"
      >
        <template #header="{selected}">
          <div class="bulk-actions">
            <ProgressButton
              v-if="selected.length > 0"
              class="btn button-default bulk-action-button"
              :click="() => blockUsers(selected)"
            >
              {{ $t('user_card.block') }}
              <template #progress>
                {{ $t('user_card.block_progress') }}
              </template>
            </ProgressButton>
            <ProgressButton
              v-if="selected.length > 0"
              class="btn button-default"
              :click="() => unblockUsers(selected)"
            >
              {{ $t('user_card.unblock') }}
              <template #progress>
                {{ $t('user_card.unblock_progress') }}
              </template>
            </ProgressButton>
          </div>
        </template>
        <template #item="{item}">
          <BlockCard :user-id="item" />
        </template>
        <template #empty>
          {{ $t('settings.no_blocks') }}
        </template>
      </BlockList>
    </div>

    <div :label="$t('settings.mutes_tab')">
      <tab-switcher>
        <div label="Users">
          <div class="usersearch-wrapper">
            <Autosuggest
              :filter="filterUnMutedUsers"
              :query="queryUserIds"
              :placeholder="$t('settings.search_user_to_mute')"
            >
              <template #default="row">
                <MuteCard
                  :user-id="row.item"
                />
              </template>
            </Autosuggest>
          </div>
          <MuteList
            :refresh="true"
            :get-key="i => i"
          >
            <template #header="{selected}">
              <div class="bulk-actions">
                <ProgressButton
                  v-if="selected.length > 0"
                  class="btn button-default"
                  :click="() => muteUsers(selected)"
                >
                  {{ $t('user_card.mute') }}
                  <template #progress>
                    {{ $t('user_card.mute_progress') }}
                  </template>
                </ProgressButton>
                <ProgressButton
                  v-if="selected.length > 0"
                  class="btn button-default"
                  :click="() => unmuteUsers(selected)"
                >
                  {{ $t('user_card.unmute') }}
                  <template #progress>
                    {{ $t('user_card.unmute_progress') }}
                  </template>
                </ProgressButton>
              </div>
            </template>
            <template #item="{item}">
              <MuteCard :user-id="item" />
            </template>
            <template #empty>
              {{ $t('settings.no_mutes') }}
            </template>
          </MuteList>
        </div>

        <div :label="$t('settings.domain_mutes')">
          <div class="domain-mute-form">
            <Autosuggest
              :filter="filterUnMutedDomains"
              :query="queryKnownDomains"
              :placeholder="$t('settings.type_domains_to_mute')"
            >
              <template #default="row">
                <DomainMuteCard
                  :domain="row.item"
                />
              </template>
            </Autosuggest>
          </div>
          <DomainMuteList
            :refresh="true"
            :get-key="i => i"
          >
            <template #header="{selected}">
              <div class="bulk-actions">
                <ProgressButton
                  v-if="selected.length > 0"
                  class="btn button-default"
                  :click="() => unmuteDomains(selected)"
                >
                  {{ $t('domain_mute_card.unmute') }}
                  <template #progress>
                    {{ $t('domain_mute_card.unmute_progress') }}
                  </template>
                </ProgressButton>
              </div>
            </template>
            <template #item="{item}">
              <DomainMuteCard :domain="item" />
            </template>
            <template #empty>
              {{ $t('settings.no_mutes') }}
            </template>
          </DomainMuteList>
        </div>
      </tab-switcher>
    </div>
  </tab-switcher>
</template>

<script src="./mutes_and_blocks_tab.js"></script>
<style lang="scss" src="./mutes_and_blocks_tab.scss"></style>
