<template>
  <Teleport to="body">
    <transition name="fade-scale">
      <div
        v-if="show"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        @click.self="$emit('close')"
      >
        <div class="glass p-8 w-full max-w-md relative shadow-2xl shadow-black/50 border border-slate-normal/10">
        <h2 class="text-2xl font-bold mb-6 text-white">Create New List</h2>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-normal mb-1">List Name</label>
            <input
              v-model="name"
              type="text"
              placeholder="e.g., Personal, Work, Groceries"
              class="input-field"
              autofocus
              ref="inputRef"
            />
          </div>

          <div class="flex justify-end gap-3 mt-10">
            <button 
              type="button"
              @click="$emit('close')" 
              class="btn px-4 bg-white/5 text-slate-normal hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="!name.trim()"
            >
              Create List
            </button>
          </div>
        </form>
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
