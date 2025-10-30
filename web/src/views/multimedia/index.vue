<template>
  <div class="multimedia-page">
    <div class="page-header">
      <h2 class="page-title">多媒体整合</h2>
      <p class="page-description">为您的人生故事添加照片、文档等珍贵回忆</p>
    </div>
    
    <LifeTimeline />
  </div>
</template>

<script setup lang="ts">
import LifeTimeline from '@/components/LifeTimeline.vue';
</script>

<style lang="scss" scoped>
.multimedia-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
  }
  
  .page-description {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .multimedia-page {
    padding: 16px;
  }
  
  .page-header {
    .page-title {
      font-size: 2rem;
    }
    
    .page-description {
      font-size: 1rem;
    }
  }
}
</style>