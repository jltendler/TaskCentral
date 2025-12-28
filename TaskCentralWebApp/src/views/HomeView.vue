<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-4xl font-black text-white tracking-tight">Todo Lists</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        <span class="mr-2 text-lg">+</span> Create New List
      </button>
    </div>

    <!-- Seed Dummy Data Button (Only show if no lists) -->
    <div v-if="lists.length === 0 && !loading" class="mb-8 text-center">
        <button 
            @click="runSeeder" 
        >
            <font-awesome-icon :icon="isSeeding ? 'spinner' : 'database'" :spin="isSeeding" class="mr-2" />
            <span v-if="isSeeding">Seeding DB with demo data...</span>
            <span v-else>Seed DB with demo data</span>
        </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-normal">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      <p>Loading your tasks...</p>
    </div>

    <div v-else-if="lists.length === 0" class="glass p-16 text-center text-slate-normal">
      <p class="text-lg">No todo lists found. Create your first one!</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TodoListCard
        v-for="list in lists"
        :key="list.id"
        :list="list"
        :is-deleting="listIdDeleting === list.id"
        @click="goToList(list.id)"
        @delete="deleteList"
        @request-delete="requestDelete"
        @cancel-delete="cancelDelete"
      />
    </div>

    <NewListModal 
      :show="showAddModal" 
      @close="showAddModal = false" 
      @create="name => createList(name)" 
    />
  </div>
</template>

<script setup>
import { useTodoLists } from '../composables/useTodoLists';
import { useSeeder } from '../composables/useSeeder';
import TodoListCard from '../components/TodoListCard.vue';
import NewListModal from '../components/NewListModal.vue';

const {
  lists,
  loading,
  showAddModal,
  listIdDeleting,
  createList,
  requestDelete,
  cancelDelete,
  deleteList,
  goToList,
  fetchLists
} = useTodoLists();

const { seed, isSeeding } = useSeeder();

const runSeeder = async () => {
    await seed(() => {
        // Refresh lists after seeding
        fetchLists();
    });
};
</script>
