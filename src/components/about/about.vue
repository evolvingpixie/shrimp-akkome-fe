<template>
  <div class="column-inner">
    <instance-specific-panel v-if="showInstanceSpecificPanel" />
    <staff-panel />
    <terms-of-service-panel />
    <LocalBubblePanel v-if="showLocalBubblePanel" />
    <MRFTransparencyPanel />
    <features-panel v-if="showFeaturesPanel" />
  </div>
</template>

<script src="./about.js"></script>

<style lang="scss">
</style>
