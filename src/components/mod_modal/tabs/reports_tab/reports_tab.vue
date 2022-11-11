<template>
  <div :label="$t('moderation.reports.reports')">
    <div class="content">
      <div class="reports-header">
        <h2>{{ $t('moderation.reports.reports') }}</h2>
        <Checkbox v-model="showClosed">
          {{ $t('moderation.reports.show_closed') }}
        </Checkbox>
      </div>
      <div class="reports">
        <div v-if="(openReports.length === 0 && !showClosed) || reports.length === 0">
          <p>{{ $t('moderation.reports.no_reports') }}</p>
        </div>
        <ReportCard
          v-for="report in (showClosed ? reports : openReports)"
          :key="report.id"
          v-bind="report"
        />
      </div>
    </div>
  </div>
</template>

<script src="./reports_tab.js"></script>
<style src="./reports_tab.scss" lang="scss"></style>
