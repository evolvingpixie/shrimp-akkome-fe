<template>
  <div :label="$t('settings.security_tab')">
    <div class="setting-item">
      <h2>{{ $t('settings.change_email') }}</h2>
      <div>
        <p>{{ $t('settings.new_email') }}</p>
        <input
          v-model="newEmail"
          type="email"
          autocomplete="email"
        >
      </div>
      <div>
        <p>{{ $t('settings.current_password') }}</p>
        <input
          v-model="changeEmailPassword"
          type="password"
          autocomplete="current-password"
        >
      </div>
      <button
        class="btn button-default"
        @click="changeEmail"
      >
        {{ $t('settings.save') }}
      </button>
      <p v-if="changedEmail">
        {{ $t('settings.changed_email') }}
      </p>
      <template v-if="changeEmailError !== false">
        <p>{{ $t('settings.change_email_error') }}</p>
        <p>{{ changeEmailError }}</p>
      </template>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.change_password') }}</h2>
      <div>
        <p>{{ $t('settings.current_password') }}</p>
        <input
          v-model="changePasswordInputs[0]"
          type="password"
        >
      </div>
      <div>
        <p>{{ $t('settings.new_password') }}</p>
        <input
          v-model="changePasswordInputs[1]"
          type="password"
        >
      </div>
      <div>
        <p>{{ $t('settings.confirm_new_password') }}</p>
        <input
          v-model="changePasswordInputs[2]"
          type="password"
        >
      </div>
      <button
        class="btn button-default"
        @click="changePassword"
      >
        {{ $t('settings.save') }}
      </button>
      <p v-if="changedPassword">
        {{ $t('settings.changed_password') }}
      </p>
      <p v-else-if="changePasswordError !== false">
        {{ $t('settings.change_password_error') }}
      </p>
      <p v-if="changePasswordError">
        {{ changePasswordError }}
      </p>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.oauth_tokens') }}</h2>
      <table class="oauth-tokens">
        <thead>
          <tr>
            <th>{{ $t('settings.app_name') }}</th>
            <th>{{ $t('settings.valid_until') }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="oauthToken in oauthTokens"
            :key="oauthToken.id"
          >
            <td>{{ oauthToken.appName }}</td>
            <td>{{ oauthToken.validUntil }}</td>
            <td class="actions">
              <button
                class="btn button-default"
                @click="revokeToken(oauthToken.id)"
              >
                {{ $t('settings.revoke_token') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <mfa />

    <div class="setting-item">
      <h2>{{ $t('settings.account_alias') }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ $t('settings.account_alias_table_head') }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="alias in aliases"
            :key="alias"
          >
            <td>{{ alias }}</td>
            <td class="actions">
              <button
                class="btn button-default"
                @click="removeAlias(alias)"
              >
                {{ $t('settings.remove_alias') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="listAliasesError"
        class="alert error"
      >
        {{ $t('settings.list_aliases_error', { error }) }}
        <FAIcon
          class="fa-scale-110 fa-old-padding"
          icon="times"
          :title="$t('settings.hide_list_aliases_error_action')"
          @click="listAliasesError = false"
        />
      </div>
      <div>
        <i18n
          path="settings.new_alias_target"
          tag="p"
        >
          <code
            place="example"
          >
            foo@example.org
          </code>
        </i18n>
        <input
          v-model="addAliasTarget"
        >
      </div>
      <button
        class="btn button-default"
        @click="addAlias"
      >
        {{ $t('settings.save') }}
      </button>
      <p v-if="addedAlias">
        {{ $t('settings.added_alias') }}
      </p>
      <template v-if="addAliasError !== false">
        <p>{{ $t('settings.add_alias_error', { error: addAliasError }) }}</p>
      </template>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.move_account') }}</h2>
      <p>{{ $t('settings.move_account_notes') }}</p>
      <div>
        <i18n
          path="settings.move_account_target"
          tag="p"
        >
          <code
            place="example"
          >
            foo@example.org
          </code>
        </i18n>
        <input
          v-model="moveAccountTarget"
        >
      </div>
      <div>
        <p>{{ $t('settings.current_password') }}</p>
        <input
          v-model="moveAccountPassword"
          type="password"
          autocomplete="current-password"
        >
      </div>
      <button
        class="btn button-default"
        @click="moveAccount"
      >
        {{ $t('settings.save') }}
      </button>
      <p v-if="movedAccount">
        {{ $t('settings.moved_account') }}
      </p>
      <template v-if="moveAccountError !== false">
        <p>{{ $t('settings.move_account_error', { error: moveAccountError }) }}</p>
      </template>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.delete_account') }}</h2>
      <p v-if="!deletingAccount">
        {{ $t('settings.delete_account_description') }}
      </p>
      <div v-if="deletingAccount">
        <p>{{ $t('settings.delete_account_instructions') }}</p>
        <p>{{ $t('login.password') }}</p>
        <input
          v-model="deleteAccountConfirmPasswordInput"
          type="password"
        >
        <button
          class="btn button-default"
          @click="deleteAccount"
        >
          {{ $t('settings.delete_account') }}
        </button>
      </div>
      <p v-if="deleteAccountError !== false">
        {{ $t('settings.delete_account_error') }}
      </p>
      <p v-if="deleteAccountError">
        {{ deleteAccountError }}
      </p>
      <button
        v-if="!deletingAccount"
        class="btn button-default"
        @click="confirmDelete"
      >
        {{ $t('settings.save') }}
      </button>
    </div>
  </div>
</template>

<script src="./security_tab.js"></script>
<!-- <style lang="scss" src="./profile.scss"></style> -->
