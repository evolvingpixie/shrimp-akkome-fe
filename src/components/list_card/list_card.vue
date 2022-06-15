<template>
  <div>
    <router-link :to="listLink(list.id)">
      {{ list.title }}
    </router-link>
  </div>
</template>

<script src="./list_card.js"></script>
