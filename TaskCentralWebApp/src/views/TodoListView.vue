<template>
  <div class="animate-fade-in">
    <div class="mb-10 flex justify-between items-end">
      <div>
        <router-link to="/" class="inline-flex items-center text-slate-500 hover:text-indigo-400 mb-4 transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Lists
        </router-link>
        <h1 class="text-4xl font-black text-white tracking-tight">{{ list?.name }}</h1>
      </div>
    </div>
    <!-- Add Item Box -->
    <div class="glass p-6 mb-8 flex gap-4 items-center focus-within:border-indigo-500/50 transition-colors shadow-xl">
      <div class="flex-grow">
        <input 
          v-model="newItem.title" 
          placeholder="What needs to be done?" 
          class="bg-transparent border-none text-xl text-white placeholder-slate-500 w-full focus:outline-none focus:ring-0" 
          @keyup.enter="addItem"
        />
      </div>
      <button 
        @click="newItem.isPriority = !newItem.isPriority" 
        class="p-2 rounded-lg transition-colors"
        :class="newItem.isPriority ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:text-slate-300'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="newItem.isPriority ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
      <button @click="addItem" class="btn btn-primary h-[50px] px-8">Add Task</button>
    </div>
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-400">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
      <p>Loading items...</p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex justify-end gap-2 mb-4">
        <button 
          v-if="items.some(i => !i.isCompleted)"
          @click="checkAll" 
          class="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-400/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Check All
        </button>
        <button 
          v-if="items.every(i => i.isCompleted)"
          @click="uncheckAll" 
          class="text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-400/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Uncheck All
        </button>
      </div>
      <div 
        v-for="item in sortedItems" 
        :key="item.id" 
        class="glass p-5 flex items-center group transition-all duration-300"
        :class="[
          item.isCompleted ? 'opacity-50 grayscale-[0.5]' : '',
          item.isPriority ? 'border-amber-500/20 bg-amber-500/[0.02]' : ''
        ]"
      >
        <!-- Custom Checkbox -->
        <div 
          @click="toggleItem(item)" 
          class="w-7 h-7 rounded-xl border-2 cursor-pointer flex items-center justify-center transition-all shrink-0"
          :class="item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 hover:border-indigo-500'"
        >
          <svg v-if="item.isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div class="ml-5 flex-grow">
          <div class="flex items-center gap-2">
            <h3 
              class="text-xl font-medium transition-all"
              :class="item.isCompleted ? 'text-slate-500 line-through' : 'text-white'"
            >
              {{ item.title }}
            </h3>
            <span v-if="item.isPriority" class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">Priority</span>
          </div>
          <p v-if="item.description" class="text-slate-500 text-sm mt-1">{{ item.description }}</p>
          <div v-if="item.dueDate" class="flex items-center gap-1.5 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" :class="getDueDateColor(item.dueDate)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs font-medium" :class="getDueDateColor(item.dueDate)">
              Due {{ formatDueDate(item.dueDate) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="togglePriority(item)" class="text-slate-500 hover:text-amber-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :fill="item.isPriority ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          
          <!-- Due Date Picker -->
          <div class="relative">
            <input 
              type="date" 
              :value="item.dueDate ? item.dueDate.split('T')[0] : ''"
              @change="(e) => setDueDate(item, e.target.value || null)"
              class="absolute inset-0 opacity-0 cursor-pointer"
              :id="`date-${item.id}`"
            />
            <label 
              :for="`date-${item.id}`"
              class="text-slate-500 hover:text-blue-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-blue-400/10 active:scale-95 flex items-center pointer-events-none"
              :class="item.dueDate ? 'text-blue-400' : ''"
              :title="item.dueDate ? `Due: ${formatDueDate(item.dueDate)}` : 'Set due date'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
          </div>
          
          <!-- Move Up/Down Controls -->
          <div class="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button 
              @click.stop="moveItem(item, 'up')" 
              class="text-slate-500 hover:text-indigo-400 p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all"
              title="Move Up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button 
              @click.stop="moveItem(item, 'down')" 
              class="text-slate-500 hover:text-indigo-400 p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all"
              title="Move Down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <button 
            @click.stop="deleteItem(item.id)" 
            class="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-400/10 active:scale-95"
            title="Delete Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="items.length === 0" class="glass border-dashed p-12 text-center text-slate-500">
        <p>No tasks in this list. Time to get productive!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTodoItems } from '../composables/useTodoItems';
import { formatDueDate, getDueDateColor } from '../composables/useDateUtils';

const props = defineProps({
  id: String
});

const {
  list,
  items,
  loading,
  newItem,
  sortedItems,
  addItem,
  toggleItem,
  togglePriority,
  moveItem,
  setDueDate,
  checkAll,
  uncheckAll,
  deleteItem
} = useTodoItems(() => props.id);
</script>
