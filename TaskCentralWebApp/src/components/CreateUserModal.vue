<template>
  <Teleport to="body">
    <div v-if="showCreateUserModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" @click="showCreateUserModal = false"></div>
      <div class="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <h3 class="text-xl font-bold text-white mb-2">Who is using TaskCentral?</h3>
        <p class="text-slate-400 text-sm mb-6">Create a profile to start tracking your tasks.</p>

        <form @submit.prevent="handleCreateUser">
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
            <input 
              v-model="newUserName"
              type="text" 
              placeholder="e.g. Billy"
              class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              autofocus
            />
          </div>

          <div class="flex gap-3">
            <button 
              type="button" 
              v-if="availableUsers.length > 0"
              @click="showCreateUserModal = false"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="!newUserName.trim()"
              class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 text-sm"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useUser } from '../composables/useUser';

const { 
  availableUsers, 
  showCreateUserModal, 
  createUser 
} = useUser();

const newUserName = ref('');

const handleCreateUser = async () => {
  if (!newUserName.value.trim()) return;
  const success = await createUser(newUserName.value);
  if (success) {
    newUserName.value = '';
  }
};
</script>
