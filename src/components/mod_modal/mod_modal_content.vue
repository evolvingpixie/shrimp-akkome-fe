<template>
  <tab-switcher
    ref="tabSwitcher"
    class="mod_tab-switcher"
    :side-tab-bar="true"
    :scrollable-tabs="true"
    :body-scroll-lock="bodyLock"
  >
    <div
      :label="$t('moderation.reports.reports')"
      icon="flag"
      data-tab-name="reports"
    >
      <ReportsTab />
    </div>
  </tab-switcher>
</template>

<script src="./mod_modal_content.js"></script>
<style src="./mod_modal_content.scss" lang="scss"></style>
