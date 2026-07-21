<template>
  <label class="flex items-center gap-3 cursor-pointer group">
    <div class="relative">
      <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" class="sr-only peer" />
      <div class="w-10 h-5 bg-gray-200 dark:bg-bg3-ink rounded-full transition-colors"
        :class="{
          'peer-checked:bg-red-500': color === 'red',
          'peer-checked:bg-bg3-gold': color === 'gold',
          'peer-checked:bg-blue-500': color === 'blue',
          'peer-checked:bg-purple-500': color === 'purple',
        }"
      ></div>
      <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
    </div>
    <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
      {{ label }}
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  label: String,
  color: { type: String, default: 'gold' },
})
defineEmits(['update:modelValue'])
</script>
