<template>
  <div
    ref="container"
    class="emoji-grid"
    :class="scrolledClass"
    @scroll.passive="onScroll"
  >
    <div
      :style="{
        height: `${gridHeight}px`,
      }"
    >
      <template v-for="item in visibleItems">
        <h6
          v-if="'title' in item && item.title.length"
          :key="'title-' + item.id"
          class="emoji-group-title"
          :style="{
            top: item.position.y + 'px',
            left: item.position.x + 'px'
          }"
        >
          {{ item.title }}
        </h6>
        <span
          v-else-if="'emoji' in item"
          :key="'emoji-' + item.id"
          class="emoji-item"
          :title="item.emoji.displayText"
          :style="{
            top: item.position.y + 'px',
            left: item.position.x + 'px'
          }"
          @click.stop.prevent="onEmoji(item.emoji)"
        >
          <span v-if="!item.emoji.imageUrl">{{ item.emoji.replacement }}</span>
          <img
            v-else
            :src="item.emoji.imageUrl"
          >
        </span>
      </template>
    </div>
  </div>
</template>

<script src="./emoji_grid.js"></script>
<style lang="scss" src="./emoji_grid.scss"></style>
