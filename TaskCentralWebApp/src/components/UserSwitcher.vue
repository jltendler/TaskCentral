<template>
  <div class="relative group">
    <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium text-white border border-white/10">
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
        {{ currentUser.charAt(0).toUpperCase() }}
      </div>
      <span>{{ currentUserName }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div class="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
      <div class="py-1">
        <button 
          v-for="user in availableUsers" 
          :key="user.id"
          @click="switchUser(user.id)"
          class="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
          :class="{'bg-primary/10 text-primary font-medium': currentUser === user.id}"
        >
          <div class="w-2 h-2 rounded-full" :class="currentUser === user.id ? 'bg-primary' : 'bg-slate-600'"></div>
          {{ user.name }}
        </button>
        <div class="border-t border-slate-700 mt-1 pt-1">
          <button 
            @click.stop="promptCreateUser"
            class="w-full text-left px-4 py-2 text-sm text-accent hover:bg-accent/10 transition-colors flex items-center gap-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create User Modal -->
  <Teleport to="body">
    <div v-if="showCreateUserModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" @click="showCreateUserModal = false"></div>
      <div class="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <h3 class="text-xl font-bold text-white mb-2">Who are you?</h3>
        <p class="text-slate-400 text-sm mb-6">Create a profile to start tracking your tasks.</p>

        <form @submit.prevent="handleCreateUser">
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
            <input 
              v-model="newUserName"
              type="text" 
              placeholder="e.g. Jean-Luc"
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
              Start using TaskCentral
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useUser } from '../composables/useUser';

const { 
  currentUser, 
  availableUsers, 
  switchUser, 
  showCreateUserModal, 
  promptCreateUser,
  createUser,
  fetchUsers 
} = useUser();

const newUserName = ref('');

const currentUserName = computed(() => {
  const user = availableUsers.value.find(u => u.id === currentUser.value);
  return user ? user.name : currentUser.value;
});

const handleCreateUser = async () => {
  if (!newUserName.value.trim()) return;
  const success = await createUser(newUserName.value);
  if (success) {
    newUserName.value = '';
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
