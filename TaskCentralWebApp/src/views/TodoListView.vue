<template>
  <div class="animate-fade-in">
    <div class="mb-10 flex justify-between items-end">
      <div>
        <router-link to="/" class="inline-flex items-center text-slate-500 hover:text-indigo-400 mb-4 transition-colors font-medium">
          <font-awesome-icon icon="arrow-left" class="mr-1 h-3.5 w-3.5" />
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
        <font-awesome-icon 
          :icon="newItem.isPriority ? 'star' : ['fas', 'star']" 
          class="h-5 w-5 transition-colors"
          :class="newItem.isPriority ? 'text-amber-500' : 'text-slate-400 hover:text-slate-300'"
        />
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
          <font-awesome-icon icon="check" class="h-4 w-4" />
          Check All
        </button>
        <button 
          v-if="items.every(i => i.isCompleted)"
          @click="uncheckAll" 
          class="text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-400/10"
        >
          <font-awesome-icon icon="times" /> <!-- swapping uncheck for a simple X might be better, but let's stick to trash/check variants or icon check-double -->
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
          <font-awesome-icon v-if="item.isCompleted" icon="check" class="h-3 w-3 text-white" />
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
            <font-awesome-icon icon="calendar-alt" class="h-3.5 w-3.5" :class="getDueDateColor(item.dueDate)" />
            <span class="text-xs font-medium" :class="getDueDateColor(item.dueDate)">
              Due {{ formatDueDate(item.dueDate) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="togglePriority(item)" class="text-slate-500 hover:text-amber-500 transition-colors">
            <font-awesome-icon 
              :icon="item.isPriority ? 'star' : ['fas', 'star']" 
              class="h-5 w-5 transition-colors"
              :class="item.isPriority ? 'text-amber-500' : 'text-slate-400 hover:text-slate-300'"
            />
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
              <font-awesome-icon icon="calendar-alt" class="h-5 w-5" />
            </label>
          </div>
          
          <!-- Move Up/Down Controls -->
          <div class="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button 
              @click.stop="moveItem(item, 'up')" 
              class="text-slate-500 hover:text-indigo-400 p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all"
              title="Move Up"
            >
              <font-awesome-icon icon="chevron-up" class="h-3 w-3" />
            </button>
            <button 
              @click.stop="moveItem(item, 'down')" 
              class="text-slate-500 hover:text-indigo-400 p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all"
              title="Move Down"
            >
              <font-awesome-icon icon="chevron-down" class="h-3 w-3" />
            </button>
          </div>
          
          <button 
            @click.stop="deleteItem(item.id)" 
            class="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-400/10 active:scale-95"
            title="Delete Task"
          >
            <font-awesome-icon icon="trash" class="h-5 w-5" />
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
