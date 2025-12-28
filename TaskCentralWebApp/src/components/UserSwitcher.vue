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

    <!-- User Switcher Dropdown Menu -->
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


const currentUserName = computed(() => {
  const user = availableUsers.value.find(u => u.id === currentUser.value);
  return user ? user.name : currentUser.value;
});

onMounted(() => {
  fetchUsers();
});
</script>
