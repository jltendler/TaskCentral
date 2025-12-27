<template>
  <aside class="w-80 shrink-0 hidden lg:block border-l border-slate-normal/10 bg-slate-darker/40 backdrop-blur-md"> <!-- hidden when below large screen -->
    <div class="sticky top-24 p-8 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h2 class="text-2xl font-black text-white tracking-tight">At A Glance</h2>
      
      <!-- Priority Tasks Section -->
      <div>
        <div 
          class="flex items-center justify-between mb-6 text-warning cursor-pointer group/header"
          @click="isPriorityCollapsed = !isPriorityCollapsed"
        >
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="star" class="h-6 w-6" />
            <h2 class="text-xl font-bold tracking-tight">Priority Tasks</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-warning/10 text-[10px] font-black uppercase tracking-widest">{{ priorityItems.length }}</span>
          </div>
          <font-awesome-icon 
            icon="chevron-down" 
            class="h-4 w-4 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isPriorityCollapsed ? '-rotate-90' : ''"
          />
        </div>

        <transition name="expand">
          <div v-show="!isPriorityCollapsed">
            <div v-if="priorityLoading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-warning"></div>
            </div>

            <div v-else-if="priorityItems.length === 0" class="text-center py-8 text-slate-normal text-sm">
              <p>No priority tasks set.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Star items to see them here</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in sortedPriorityItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-warning/30 transition-all cursor-pointer"
                :class="item.isCompleted ? 'opacity-40 grayscale-[0.5]' : ''"
                @click="goToList(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-grow min-w-0">
                    <h3 
                      class="text-sm font-medium transition-all truncate"
                      :class="item.isCompleted ? 'text-slate-normal line-through' : 'text-white group-hover:text-warning'"
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          class="flex items-center justify-between mb-6 text-info cursor-pointer group/header"
          @click="isDueSoonCollapsed = !isDueSoonCollapsed"
        >
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="clock" class="h-6 w-6" />
            <h2 class="text-xl font-bold tracking-tight">Due Soon</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-info/10 text-[10px] font-black uppercase tracking-widest">{{ dueSoonItems.length }}</span>
          </div>
          <font-awesome-icon 
            icon="chevron-down" 
            class="h-4 w-4 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isDueSoonCollapsed ? '-rotate-90' : ''"
          />
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
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-info"></div>
            </div>

            <div v-else-if="dueSoonItems.length === 0" class="text-center py-8 text-slate-normal text-sm">
              <p>No items due soon.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Items due within 7 days appear here</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in dueSoonItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-info/30 transition-all cursor-pointer"
                @click="goToListDueSoon(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-grow min-w-0">
                    <h3 class="text-sm font-medium transition-all truncate text-white group-hover:text-info">
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          class="flex items-center justify-between mb-6 text-danger cursor-pointer group/header"
          @click="isOverdueCollapsed = !isOverdueCollapsed"
        >
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="exclamation-triangle" class="h-6 w-6" />
            <h2 class="text-xl font-bold tracking-tight">Overdue</h2>
            <span class="ml-2 px-1.5 py-0.5 rounded-md bg-danger/10 text-[10px] font-black uppercase tracking-widest">{{ overdueItems.length }}</span>
          </div>
          <font-awesome-icon 
            icon="chevron-down" 
            class="h-4 w-4 transition-transform duration-300 transform group-hover/header:translate-x-0.5" 
            :class="isOverdueCollapsed ? '-rotate-90' : ''"
          />
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
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-danger"></div>
            </div>

            <div v-else-if="overdueItems.length === 0" class="text-center py-8 text-slate-normal text-sm">
              <p>No overdue items.</p>
              <p class="mt-2 text-[10px] uppercase tracking-widest font-bold">Good work! :)</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="item in overdueItems" 
                :key="item.id" 
                class="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-danger/30 transition-all cursor-pointer"
                @click="goToListOverdue(item.todoListId)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-grow min-w-0">
                    <h3 class="text-sm font-medium transition-all truncate text-white group-hover:text-danger">
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  goToList
} = usePriorityItems();

const {
  items: dueSoonItems,
  loading: dueSoonLoading,
  goToList: goToListDueSoon
} = useDueSoonItems();

const {
  items: overdueItems,
  loading: overdueLoading,
  goToList: goToListOverdue
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
