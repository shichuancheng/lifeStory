<template>
  <div class="biography-generator-page">
    <div class="page-header">
      <h2 class="page-title">传记生成器</h2>
      <p class="page-description">基于您的访谈内容，AI将为您生成专业的个人传记</p>
    </div>
    
    <BiographyPreview />
  </div>
</template>

<script setup lang="ts">
import BiographyPreview from '@/components/BiographyPreview.vue';
</script>

<style lang="scss" scoped>
.biography-generator-page {
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
  .biography-generator-page {
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