<template>
  <div class="mb-5">
    <h4 class="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      <span v-if="icon">{{ icon }}</span>
      {{ title }}
    </h4>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
})
</script>
