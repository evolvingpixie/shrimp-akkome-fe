<template>
  <div class="settings panel panel-default">
    <div class="panel-heading">
      <div class="title">
        {{ $t('lists.lists') }}
      </div>
    </div>
    <div class="panel-body">
      <ListCard
        v-for="list in lists.slice().reverse()"
        :key="list"
        :list="list"
        class="list-item"
      />
    </div>
  </div>
</template>

<script src="./lists.js"></script>
