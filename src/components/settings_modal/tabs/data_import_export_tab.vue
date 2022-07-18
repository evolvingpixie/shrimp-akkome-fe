<template>
  <div
    :label="$t('settings.data_import_export_tab')"
  >
    <div class="setting-item">
      <h2>{{ $t('settings.follow_import') }}</h2>
      <p>{{ $t('settings.import_followers_from_a_csv_file') }}</p>
      <Importer
        :submit-handler="importFollows"
        :success-message="$t('settings.follows_imported')"
        :error-message="$t('settings.follow_import_error')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.follow_export') }}</h2>
      <Exporter
        :get-content="getFollowsContent"
        filename="friends.csv"
        :export-button-label="$t('settings.follow_export_button')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.block_import') }}</h2>
      <p>{{ $t('settings.import_blocks_from_a_csv_file') }}</p>
      <Importer
        :submit-handler="importBlocks"
        :success-message="$t('settings.blocks_imported')"
        :error-message="$t('settings.block_import_error')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.block_export') }}</h2>
      <Exporter
        :get-content="getBlocksContent"
        filename="blocks.csv"
        :export-button-label="$t('settings.block_export_button')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.mute_import') }}</h2>
      <p>{{ $t('settings.import_mutes_from_a_csv_file') }}</p>
      <Importer
        :submit-handler="importMutes"
        :success-message="$t('settings.mutes_imported')"
        :error-message="$t('settings.mute_import_error')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.mute_export') }}</h2>
      <Exporter
        :get-content="getMutesContent"
        filename="mutes.csv"
        :export-button-label="$t('settings.mute_export_button')"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.account_backup') }}</h2>
      <p>{{ $t('settings.account_backup_description') }}</p>
      <table>
        <thead>
          <tr>
            <th>{{ $t('settings.account_backup_table_head') }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="backup in backups"
            :key="backup.id"
          >
            <td>{{ backup.inserted_at }}</td>
            <td class="actions">
              <a
                v-if="backup.processed"
                target="_blank"
                :href="backup.url"
              >
                {{ $t('settings.download_backup') }}
              </a>
              <span
                v-else
              >
                {{ $t('settings.backup_not_ready') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="listBackupsError"
        class="alert error"
      >
        {{ $t('settings.list_backups_error', { error }) }}
        <button
          :title="$t('settings.hide_list_backups_error_action')"
          @click="listBackupsError = false"
        >
          <FAIcon
            class="fa-scale-110 fa-old-padding"
            icon="times"
          />
        </button>
      </div>
      <button
        class="btn button-default"
        @click="addBackup"
      >
        {{ $t('settings.add_backup') }}
      </button>
      <p v-if="addedBackup">
        {{ $t('settings.added_backup') }}
      </p>
      <template v-if="addBackupError !== false">
        <p>{{ $t('settings.add_backup_error', { error: addBackupError }) }}</p>
      </template>
    </div>
  </div>
</template>

<script src="./data_import_export_tab.js"></script>
<!-- <style lang="scss" src="./profile.scss"></style> -->
