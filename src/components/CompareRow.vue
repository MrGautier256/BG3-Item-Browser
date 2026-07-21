<template>
  <div class="flex justify-between items-start gap-2 py-1 border-b border-gray-100 dark:border-bg3-ink/30 last:border-0">
    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{{ label }}</span>
    <span class="text-xs font-medium text-gray-800 dark:text-gray-200 text-right break-words">{{ value }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
})
</script>
