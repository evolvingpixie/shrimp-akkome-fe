<template>
  <div
    v-if="bubbleInstances"
    class="bubble-panel"
  >
    <div class="panel panel-default base01-background">
      <div class="panel-heading timeline-heading base02-background">
        <div class="title">
          {{ $t("about.bubble_instances") }}
        </div>
      </div>
      <div class="panel-body">
        <p>{{ $t("about.bubble_instances_description") }}:</p>
        <ul>
          <li
            v-for="instance in bubbleInstances"
            :key="instance"
            v-text="instance"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./local_bubble_panel.js"></script>

<style lang="scss">
@import '../../_variables.scss';
@import './local_bubble_panel.scss';
</style>
