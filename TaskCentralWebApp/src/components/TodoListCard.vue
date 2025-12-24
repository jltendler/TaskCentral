<template>
  <div 
    class="glass p-6 cursor-pointer group hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col" 
    @click="$emit('click')"
  >
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{{ list.name }}</h3>
      <transition name="fade-scale" mode="out-in">
        <div v-if="isDeleting" class="flex items-center gap-1">
          <span class="text-xs">Really Delete?</span>
          <button 
            @click.stop="$emit('delete', list.id)" 
            class="text-emerald-400 hover:text-emerald-300 transition-colors p-1 rounded-lg hover:bg-emerald-400/10"
            title="Confirm Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button 
            @click.stop="$emit('cancelDelete')" 
            class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button 
          v-else-if="!list.items?.length || list.items.every(i => i.isCompleted)"
          @click.stop="$emit('requestDelete', list.id)" 
          class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
          title="Delete List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </transition>
    </div>
    
    <div class="flex items-center gap-4 text-sm font-medium">
      <p class="text-slate-400">
        <span class="text-indigo-400">({{ completedCount }} / {{ list.items?.length || 0 }})</span> items
      </p>
      <div v-if="priorityCount > 0" class="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-black">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {{ priorityCount }}
      </div>
    </div>
    
    <div class="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-medium tracking-wider uppercase">
      <!-- <span>Created {{ formattedDate }}</span> -->
      <span class="text-indigo-400/70 group-hover:text-indigo-400">View List -></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  list: {
    type: Object,
    required: true
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click', 'delete', 'requestDelete', 'cancelDelete']);

const completedCount = computed(() => {
  return props.list.items?.filter(i => i.isCompleted).length || 0;
});

const priorityCount = computed(() => {
  return props.list.items?.filter(i => i.isPriority).length || 0;
});

const formattedDate = computed(() => {
  if (!props.list.createdAt) return '';
  return new Date(props.list.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});
</script>
