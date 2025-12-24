<template>
  <aside class="w-80 shrink-0 hidden lg:block border-l border-white/5 bg-slate-900/40 backdrop-blur-md"> <!-- hidden when below large screen -->
    <div class="sticky top-24 p-8 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <!-- Priority Tasks Section -->
      <div>
        <div 
          class="flex items-center justify-between mb-6 text-amber-500 cursor-pointer group/header"
          @click="isPriorityCollapsed = !isPriorityCollapsed"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 class="text-xl font-bold tracking-tight">Priority Tasks</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-black uppercase tracking-widest">{{ priorityItems.length }}</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isPriorityCollapsed ? '-rotate-90' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <transition name="expand">
          <div v-show="!isPriorityCollapsed">
            <div v-if="priorityLoading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
            </div>

            <div v-else-if="priorityItems.length === 0" class="text-center py-8 text-slate-500 text-sm">
              <p>No priority tasks set.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Star items to see them here</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in sortedPriorityItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
                :class="item.isCompleted ? 'opacity-40 grayscale-[0.5]' : ''"
                @click="goToList(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div 
                    class="w-5 h-5 rounded-lg border cursor-pointer flex items-center justify-center transition-all shrink-0 mt-0.5"
                    :class="item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 group-hover:border-amber-500'"
                    @click.stop="togglePriorityItem(item)"
                  >
                    <svg v-if="item.isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-grow min-w-0">
                    <h3 
                      class="text-sm font-medium transition-all truncate"
                      :class="item.isCompleted ? 'text-slate-500 line-through' : 'text-white group-hover:text-amber-400'"
                    >
                      {{ item.title }}
                    </h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {{ item.todoList?.name || 'Loading list...' }}
                    </p>
                    <p v-if="item.dueDate"
                       class="text-[10px] mt-1"
                       :class="getDueDateColor(item.dueDate)">
                      Due {{ formatDueDate(item.dueDate) }}
                    </p>
                  </div>
                  <div class="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Due Soon Section -->
      <div>
        <div 
          class="flex items-center justify-between mb-6 text-blue-400 cursor-pointer group/header"
          @click="isDueSoonCollapsed = !isDueSoonCollapsed"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-xl font-bold tracking-tight">Due Soon</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-blue-400/10 text-[10px] font-black uppercase tracking-widest">{{ dueSoonItems.length }}</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isDueSoonCollapsed ? '-rotate-90' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <transition 
          enter-active-class="transition-all duration-300 ease-in-out"
          leave-active-class="transition-all duration-300 ease-in-out"
          enter-from-class="max-h-0 opacity-0 -translate-y-[10px]"
          enter-to-class="max-h-[1000px] opacity-100 translate-y-0"
          leave-from-class="max-h-[1000px] opacity-100 translate-y-0"
          leave-to-class="max-h-0 opacity-0 -translate-y-[10px]"
        >
          <div v-show="!isDueSoonCollapsed">
            <div v-if="dueSoonLoading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            </div>

            <div v-else-if="dueSoonItems.length === 0" class="text-center py-8 text-slate-500 text-sm">
              <p>No items due soon.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Items due within 7 days appear here</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in dueSoonItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-400/30 transition-all cursor-pointer"
                @click="goToListDueSoon(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div 
                    class="w-5 h-5 rounded-lg border cursor-pointer flex items-center justify-center transition-all shrink-0 mt-0.5"
                    :class="item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 group-hover:border-blue-400'"
                    @click.stop="toggleDueSoonItem(item)"
                  >
                    <svg v-if="item.isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-grow min-w-0">
                    <h3 class="text-sm font-medium transition-all truncate text-white group-hover:text-blue-400">
                      {{ item.title }}
                    </h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {{ item.todoList?.name || 'Loading list...' }}
                    </p>
                    <p class="text-[10px] mt-1" :class="getDueDateColor(item.dueDate)">
                      Due {{ formatDueDate(item.dueDate) }}
                    </p>
                  </div>
                  <div class="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Overdue Section -->
      <div>
        <div 
          class="flex items-center justify-between mb-6 text-red-400 cursor-pointer group/header"
          @click="isOverdueCollapsed = !isOverdueCollapsed"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-xl font-bold tracking-tight">Overdue</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-red-400/10 text-[10px] font-black uppercase tracking-widest">{{ overdueItems.length }}</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isOverdueCollapsed ? '-rotate-90' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <transition 
          enter-active-class="transition-all duration-300 ease-in-out"
          leave-active-class="transition-all duration-300 ease-in-out"
          enter-from-class="max-h-0 opacity-0 -translate-y-[10px]"
          enter-to-class="max-h-[1000px] opacity-100 translate-y-0"
          leave-from-class="max-h-[1000px] opacity-100 translate-y-0"
          leave-to-class="max-h-0 opacity-0 -translate-y-[10px]"
        >
          <div v-show="!isOverdueCollapsed">
            <div v-if="overdueLoading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
            </div>

            <div v-else-if="overdueItems.length === 0" class="text-center py-8 text-slate-500 text-sm">
              <p>No overdue items.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Good work! :)</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in overdueItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-400/30 transition-all cursor-pointer"
                @click="goToListOverdue(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div 
                    class="w-5 h-5 rounded-lg border cursor-pointer flex items-center justify-center transition-all shrink-0 mt-0.5"
                    :class="item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 group-hover:border-red-400'"
                    @click.stop="toggleOverdueItem(item)"
                  >
                    <svg v-if="item.isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-grow min-w-0">
                    <h3 class="text-sm font-medium transition-all truncate text-white group-hover:text-red-400">
                      {{ item.title }}
                    </h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {{ item.todoList?.name || 'Loading list...' }}
                    </p>
                    <p class="text-[10px] mt-1" :class="getDueDateColor(item.dueDate)">
                      Due {{ formatDueDate(item.dueDate) }}
                    </p>
                  </div>
                  <div class="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { usePriorityItems } from '../composables/usePriorityItems';
import { useDueSoonItems } from '../composables/useDueSoonItems';
import { useOverdueItems } from '../composables/useOverdueItems';
import { formatDueDate, getDueDateColor } from '../composables/useDateUtils';

// Open/Closed status of the 3 sidebar sections
const isPriorityCollapsed = ref(false);
const isDueSoonCollapsed = ref(false);
const isOverdueCollapsed = ref(false);

const {
  priorityItems,
  sortedPriorityItems,
  loading: priorityLoading,
  goToList,
  toggleItem: togglePriorityItem
} = usePriorityItems();

const {
  items: dueSoonItems,
  loading: dueSoonLoading,
  goToList: goToListDueSoon,
  toggleItem: toggleDueSoonItem
} = useDueSoonItems();

const {
  items: overdueItems,
  loading: overdueLoading,
  goToList: goToListOverdue,
  toggleItem: toggleOverdueItem
} = useOverdueItems();
</script>

<style scoped> 
/* scoped so it only applies to the sidebar */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
