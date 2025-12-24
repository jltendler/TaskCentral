<template>
  <Teleport to="body">
    <transition name="fade-scale">
      <div 
        v-if="show" 
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
        @click.self="$emit('close')"
      >
        <div class="glass max-w-md w-full p-8 animate-fade-in shadow-2xl -mt-32">
          <h2 class="text-2xl font-bold text-white mb-6">New List</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">List Name</label>
              <input 
                v-model="name" 
                placeholder="e.g. Shopping, Projects, Movies..." 
                class="input-field" 
                @keyup.enter="handleCreate"
                ref="inputRef"
              />
            </div>
          </div>
  
          <div class="flex justify-end gap-3 mt-10">
            <button 
              @click="$emit('close')" 
              class="btn px-4 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button 
              @click="handleCreate" 
              class="btn btn-primary"
              :disabled="!name.trim()"
            >
              Create List
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'create']);

const name = ref('');
const inputRef = ref(null);

watch(() => props.show, async (newVal) => {
  if (newVal) {
    name.value = '';
    await nextTick();
    inputRef.value?.focus();
  }
});

const handleCreate = () => {
  if (name.value.trim()) {
    emit('create', name.value.trim());
  }
};
</script>
