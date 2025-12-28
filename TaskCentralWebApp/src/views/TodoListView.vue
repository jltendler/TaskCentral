<template>
  <div class="animate-fade-in">
    <div class="mb-10 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black text-white tracking-tight mb-4">{{ list?.name }}</h1>
        <router-link to="/" class="inline-flex items-center text-slate-500 hover:text-indigo-400 transition-colors font-medium">
          <font-awesome-icon icon="arrow-left" class="mr-1 h-3.5 w-3.5" />
          Back to Lists
        </router-link>
      </div>
    </div>
    <div class="glass p-6 mb-8 flex gap-4 items-center focus-within:border-primary/50 transition-colors shadow-xl">
      <div class="flex-grow">
        <input
          v-model="newItem.title"
          type="text"
          placeholder="Add to do..."
          class="w-full bg-transparent text-white placeholder-slate-normal focus:outline-none text-lg py-2"
          @keyup.enter="addItem"
        />
      </div>
      <button
        @click="newItem.isPriority = !newItem.isPriority"
        class="p-2 rounded-lg transition-colors"
        :class="newItem.isPriority ? 'bg-warning/20 text-warning' : 'text-slate-normal hover:text-slate-300'"
      >
        <font-awesome-icon
          :icon="newItem.isPriority ? 'star' : ['fas', 'star']"
          class="h-5 w-5 transition-colors cursor-pointer"
          :class="newItem.isPriority ? 'text-warning' : 'text-slate-400 hover:text-slate-300'"
        />
        <!-- wow this syntax is excellent for dynamic tailwinds classes, seems to bypass the need for twmerge()-->
      </button>
      <button @click="addItem" class="btn btn-primary h-[50px] px-8 cursor-pointer">Add Task</button>
    </div>
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-normal">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      <p>Loading items...</p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex justify-end gap-2 mb-4">
        <button
          v-if="items.some(i => !i.isCompleted)"
          @click="checkAll"
          class="text-sm font-bold text-primary hover:text-primary-light transition-colors flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
        >
          <font-awesome-icon icon="check" class="h-4 w-4" />
          Check All
        </button>
        <button
          v-if="items.every(i => i.isCompleted)"
          @click="uncheckAll"
          class="text-sm font-bold text-slate-normal hover:text-slate-300 transition-colors flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-400/10"
        >
          <font-awesome-icon icon="times" />
          Uncheck All
        </button>
      </div>
      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="glass p-5 flex items-center group transition-all duration-300"
        :class="[
          item.isCompleted ? 'opacity-50 grayscale-[0.5]' : '',
          item.isPriority ? 'border-warning/20 bg-warning/[0.02]' : ''
        ]"
      >
        <!-- Custom Checkbox -->
        <div
          @click="toggleItem(item)"
          class="w-7 h-7 rounded-xl border-2 cursor-pointer flex items-center justify-center transition-all shrink-0"
          :class="item.isCompleted ? 'bg-accent border-accent' : 'border-slate-normal hover:border-primary'"
        >
          <font-awesome-icon v-if="item.isCompleted" icon="check" class="h-3 w-3 text-white" />
        </div>

        <div class="ml-5 flex-grow">
          <div class="flex items-center gap-2">
            <h3
              class="text-xl font-medium transition-all"
              :class="item.isCompleted ? 'text-slate-normal line-through' : 'text-white'"
            >
              {{ item.title }}
            </h3>
            <span v-if="item.isPriority" class="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider">Priority</span>
          </div>
          <p v-if="item.description" class="text-slate-normal text-sm mt-1">{{ item.description }}</p>
          <div v-if="item.dueDate" class="flex items-center gap-1.5 mt-2">
            <font-awesome-icon icon="calendar-alt" class="h-3.5 w-3.5" :class="getDueDateColor(item.dueDate)" />
            <span class="text-xs font-medium" :class="getDueDateColor(item.dueDate)">
              Due {{ formatDueDate(item.dueDate) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="togglePriority(item)"
            class="text-slate-normal hover:text-warning transition-colors !cursor-pointer"
          >
            <font-awesome-icon
              :icon="item.isPriority ? 'star' : ['fas', 'star']"
              class="h-5 w-5 transition-colors"
              :class="item.isPriority ? 'text-warning' : 'text-slate-400 hover:text-slate-300'"
            />
          </button>

          <!-- Due Date Picker -->
          <div class="relative group/date p-2 rounded-lg hover:bg-info/10 transition-colors !cursor-pointer">
            <input
              type="date"
              :value="item.dueDate ? item.dueDate.split('T')[0] : ''"
              @change="(e) => setDueDate(item, e.target.value || null)"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              :id="`date-${item.id}`"
            />
            <label
              :for="`date-${item.id}`"
              class="text-slate-normal group-hover/date:text-info transition-colors cursor-pointer flex items-center pointer-events-none"
              :class="item.dueDate ? 'text-info' : ''"
              :title="item.dueDate ? `Due: ${formatDueDate(item.dueDate)}` : 'Set due date'"
            >
              <font-awesome-icon icon="calendar-alt" class="h-5 w-5 cursor-pointer" />
            </label>
          </div>

          <!-- Move Up/Down Controls -->
          <div class="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button
              @click.stop="moveItem(item, 'up')"
              class="text-slate-normal hover:text-primary p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Move Up"
            >
              <font-awesome-icon icon="chevron-up" class="h-3 w-3" />
            </button>
            <button
              @click.stop="moveItem(item, 'down')"
              class="text-slate-normal hover:text-primary p-0.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Move Down"
            >
              <font-awesome-icon icon="chevron-down" class="h-3 w-3" />
            </button>
          </div>

          <button
            @click.stop="deleteItem(item.id)"
            class="text-slate-normal hover:text-danger transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 active:scale-95 cursor-pointer"
            title="Delete Task"
          >
            <font-awesome-icon icon="trash" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div v-if="items.length === 0" class="glass border-dashed p-12 text-center text-slate-normal">
        <p>No tasks in this list. Add some above!</p>
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
