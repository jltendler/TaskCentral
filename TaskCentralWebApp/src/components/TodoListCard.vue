<template>
  <div
    class="glass p-6 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group flex flex-col h-full border border-white/5 hover:border-primary/30 relative overflow-hidden"
    @click="$emit('click')"
  >
  <!-- A little bit of pizazz in the top right corner of cards -->
    <div class="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-full -mr-5 -mt-5 transition-transform group-hover:scale-110"></div>
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-white group-hover:text-primary transition-colors">{{ list.name }}</h3>
      <transition name="fade-scale" mode="out-in">
        <div v-if="isDeleting" class="flex items-center gap-1">
          <span class="text-xs">Really Delete?</span>
          <button
            @click.stop="$emit('delete', list.id)"
            class="text-emerald-400 hover:text-emerald-300 transition-colors p-1 rounded-lg hover:bg-emerald-400/10"
            title="Confirm Delete"
          >
            <font-awesome-icon icon="check" class="h-5 w-5" />
          </button>
          <button
            @click.stop="$emit('cancelDelete')"
            class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            title="Cancel"
          >
            <font-awesome-icon icon="times" class="h-5 w-5" />
          </button>
        </div>
        <button
          v-else-if="!list.items?.length || list.items.every(i => i.isCompleted)"
          @click.stop="$emit('requestDelete', list.id)"
          class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
          title="Delete List"
        >
          <font-awesome-icon icon="trash" class="h-5 w-5" />
        </button>
      </transition>
    </div>

    <div class="flex items-center gap-3 text-sm font-medium mb-4">
      <p class="text-slate-normal">
        <span class="text-primary">({{ completedCount }} / {{ list.items?.length || 0 }})</span> items
      </p>
      <div v-if="priorityCount > 0" class="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-black">
        <font-awesome-icon icon="star" class="h-3 w-3" />
        {{ priorityCount }}
      </div>
    </div>
    
    <div class="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-medium tracking-wider uppercase">
      <!-- <span>Created {{ formattedDate }}</span> -->
      <span class="text-indigo-400/70 group-hover:text-indigo-400">View List <font-awesome-icon icon="arrow-right" class="ml-1 transition-transform group-hover:translate-x-1" /></span>
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
