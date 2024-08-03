<template>
  <div class="report-card panel">
    <div
      class="panel-heading"
      @click="toggleHidden"
    >
      <h4>{{ $t('moderation.reports.report') + ' ' + account.screen_name }}</h4>
      <button
        v-if="isOpen"
        class="button-default"
        @click.stop="updateReportState('closed')"
      >
        {{ $t('moderation.reports.close') }}
      </button>
      <button
        v-if="isOpen"
        class="button-default"
        @click.stop="updateReportState('resolved')"
      >
        {{ $t('moderation.reports.resolve') }}
      </button>
      <button
        v-else
        class="button-default"
        @click.stop="updateReportState('open')"
      >
        {{ $t('moderation.reports.reopen') }}
      </button>
    </div>
    <div
      v-if="!hidden"
      class="panel-body report-body"
    >
      <div class="report-content">
        <div v-if="content">
          {{ decode(content) }}
        </div>
        <i
          v-else
          class="faint"
        >
          {{ $t('moderation.reports.no_content') }}
        </i>
        <div class="report-author">
          <UserAvatar
            class="small-avatar"
            :user="actor"
          />
          {{ actor.screen_name }}
        </div>
      </div>
      <div
        v-if="!hidden && statuses.length > 0"
        class="dropdown"
      >
        <button
          class="button button-unstyled dropdown-header"
          @click="toggleStatuses"
        >
          {{ $tc('moderation.reports.statuses', statuses.length - 1, { count: statuses.length }) }}
          <FAIcon
            class="timelines-chevron"
            fixed-width
            :icon="statusesHidden ? 'chevron-down' : 'chevron-up'"
          />
        </button>
        <div v-if="!statusesHidden">
          <Status
            v-for="status in statuses"
            :key="status.id"
            :collapsable="false"
            :expandable="false"
            :compact="false"
            :statusoid="status"
            :no-heading="false"
          />
        </div>
      </div>
      <div
        v-if="!hidden && notes.length > 0"
        class="dropdown"
      >
        <button
          class="button button-unstyled dropdown-header"
          @click="toggleNotes"
        >
          {{ $tc('moderation.reports.notes', notes.length - 1, { count: notes.length }) }}
          <FAIcon
            class="timelines-chevron"
            fixed-width
            :icon="notesHidden ? 'chevron-down' : 'chevron-up'"
          />
        </button>
        <div v-if="!notesHidden">
          <ReportNote
            v-for="note in notes"
            :key="note.id"
            :report_id="id"
            v-bind="note"
          />
        </div>
      </div>
      <div class="report-add-note">
        <textarea
          v-model.trim="note"
          rows="1"
          cols="1"
          :placeholder="$t('moderation.reports.note_placeholder')"
        />
        <button
          class="btn button-default"
          @click.stop="addNoteToReport"
        >
          {{ $t('moderation.reports.add_note') }}
        </button>
      </div>
    </div>
    <div
      v-if="!hidden"
      class="panel-footer"
    >
      <button
        class="btn button-default"
        @click.stop="toggleActivationStatus"
      >
        {{ $t(!!user.deactivated ? 'user_card.admin_menu.activate_account' : 'user_card.admin_menu.deactivate_account') }}
      </button>
      <button
        class="btn button-default"
        @click.stop="deleteUser"
      >
        {{ $t('user_card.admin_menu.delete_account') }}
      </button>
      <Popover
        trigger="click"
        placement="top"
        :offset="{ y: 5 }"
        remove-padding
      >
        <template #trigger>
          <button
            class="btn button-default"
            :disabled="!tagPolicyEnabled"
            :title="tagPolicyEnabled ? '' : $t('moderation.reports.account.tag_policy_notice')"
          >
            <span>{{ $t("moderation.reports.tags") }}</span>
            {{ ' ' }}
            <FAIcon
              icon="chevron-down"
            />
          </button>
        </template>
        <template #content="{close}">
          <div
            class="dropdown-menu"
            :disabled="!tagPolicyEnabled"
          >
            <button
              class="button-default dropdown-item dropdown-item-icon"
              @click.prevent="toggleTag(tags.FORCE_NSFW)"
            >
              <span
                class="menu-checkbox"
                :class="{ 'menu-checkbox-checked': hasTag(tags.FORCE_NSFW) }"
              />
              {{ $t('user_card.admin_menu.force_nsfw') }}
            </button>
            <button
              class="button-default dropdown-item dropdown-item-icon"
              @click.prevent="toggleTag(tags.STRIP_MEDIA)"
            >
              <span
                class="menu-checkbox"
                :class="{ 'menu-checkbox-checked': hasTag(tags.STRIP_MEDIA) }"
              />
              {{ $t('user_card.admin_menu.strip_media') }}
            </button>
            <button
              class="button-default dropdown-item dropdown-item-icon"
              @click.prevent="toggleTag(tags.FORCE_UNLISTED)"
            >
              <span
                class="menu-checkbox"
                :class="{ 'menu-checkbox-checked': hasTag(tags.FORCE_UNLISTED) }"
              />
              {{ $t('user_card.admin_menu.force_unlisted') }}
            </button>
            <button
              class="button-default dropdown-item dropdown-item-icon"
              @click.prevent="toggleTag(tags.SANDBOX)"
            >
              <span
                class="menu-checkbox"
                :class="{ 'menu-checkbox-checked': hasTag(tags.SANDBOX) }"
              />
              {{ $t('user_card.admin_menu.sandbox') }}
            </button>
          </div>
        </template>
      </popover>
    </div>
  </div>
</template>

<script src="./report_card.js"></script>
