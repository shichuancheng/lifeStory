<template>
  <div class="interview-page">
    <InterviewSession />
  </div>
</template>

<script setup lang="ts">
import InterviewSession from '@/components/InterviewSession.vue';
</script>

<style lang="scss" scoped>
.interview-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>