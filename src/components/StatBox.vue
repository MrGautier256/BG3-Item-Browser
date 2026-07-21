<template>
  <div class="p-3 rounded-xl bg-gray-50 dark:bg-bg3-ink/30 text-center">
    <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ icon }} {{ label }}</p>
    <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1 break-words">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
  icon: { type: String, default: '' },
})
</script>
