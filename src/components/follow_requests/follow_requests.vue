<template>
  <div class="settings panel panel-default">
    <div class="panel-heading">
      <div class="title">
        {{ $t('nav.friend_requests') }}
      </div>
    </div>
    <div class="panel-body">
      <FollowRequestList :user-id="userId">
        <template #item="{item}">
          <FollowRequestCard :user="item" />
        </template>
      </FollowRequestList>
    </div>
  </div>
</template>

<script src="./follow_requests.js"></script>
