<template>
  <div>
    <button
      @click="open = !open"
      class="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      <span class="flex items-center gap-1.5">
        {{ label }}
        <span v-if="count > 0" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-bg3-gold/20 text-bg3-gold-dark dark:text-bg3-gold text-[10px] font-bold">
          {{ count }}
        </span>
      </span>
      <span class="transition-transform" :class="open ? 'rotate-180' : ''">▾</span>
    </button>
    <div v-show="open" class="space-y-1 max-h-44 overflow-y-auto rounded-xl border border-gray-200 dark:border-bg3-ink bg-gray-50 dark:bg-bg3-ink/30 p-2">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  label: { type: String, required: true },
  count: { type: Number, default: 0 },
})

const open = ref(true)
</script>
