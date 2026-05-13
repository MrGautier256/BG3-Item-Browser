<template>
  <div class="mb-5">
    <h4 class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
      <span class="w-1.5 h-1.5 rounded-full" :class="iconColor"></span>
      {{ title }}
    </h4>
    <div class="pl-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  iconColor: { type: String, default: 'bg-bg3-gold' },
})
</script>
