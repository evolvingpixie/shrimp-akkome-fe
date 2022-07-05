<template>
  <div class="panel-default panel list-new">
    <div
      ref="header"
      class="panel-heading"
    >
      <button
        class="button-unstyled go-back-button"
        @click="goBack"
      >
        <FAIcon
          size="lg"
          icon="chevron-left"
        />
      </button>
    </div>
    <div class="input-wrap">
      <input
        ref="title"
        v-model="title"
        :placeholder="$t('lists.title')"
      >
    </div>

    <div class="member-list">
      <div
        v-for="user in selectedUsers"
        :key="user.id"
        class="member"
      >
        <BasicUserCard
          :user="user"
          :class="isSelected(user) ? 'selected' : ''"
          @click.capture.prevent="selectUser(user)"
        />
      </div>
    </div>
    <ListUserSearch
      @results="onResults"
    />
    <div
      v-for="user in users"
      :key="user.id"
      class="member"
    >
      <BasicUserCard
        :user="user"
        :class="isSelected(user) ? 'selected' : ''"
        @click.capture.prevent="selectUser(user)"
      />
    </div>

    <button
      :disabled="title && title.length === 0"
      class="btn button-default"
      @click="createList"
    >
      {{ $t('lists.create') }}
    </button>
  </div>
</template>

<script src="./list_new.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.list-new {
  .search-icon {
    margin-right: 0.3em;
  }

  .member-list {
    padding-bottom: 0.7rem;
  }

  .basic-user-card:hover,
  .basic-user-card.selected {
    cursor: pointer;
    background-color: var(--selectedPost, $fallback--lightBg);
  }

  .go-back-button {
    text-align: center;
    line-height: 1;
    height: 100%;
    align-self: start;
    width: var(--__panel-heading-height-inner);
  }

  .btn {
    margin: 0.5em;
  }
}
</style>
