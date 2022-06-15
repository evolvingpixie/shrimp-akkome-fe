<template>
  <router-link
    :to="listLink(list.id)"
    class="list-card"
  >
    {{ list.title }}
  </router-link>
</template>

<script src="./list_card.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.list-card {
  margin: 0;
  padding: 1em;
  display: flex;
  flex: 1 0;
  color: $fallback--link;
  color: var(--link, $fallback--link);

  &:hover {
    background-color: $fallback--lightBg;
    background-color: var(--selectedMenu, $fallback--lightBg);
    color: $fallback--link;
    color: var(--selectedMenuText, $fallback--link);
    --faint: var(--selectedMenuFaintText, $fallback--faint);
    --faintLink: var(--selectedMenuFaintLink, $fallback--faint);
    --lightText: var(--selectedMenuLightText, $fallback--lightText);
  }
}
</style>
