<template>
  <div class="min-h-screen">
    <nav class="glass mb-8 rounded-b-2xl rounded-t-none border-t-0 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <router-link to="/" class="text-2xl font-extrabold text-white flex items-center gap-2 group">
          <span class="transition-transform group-hover:scale-110">
            <img src="/favicon.svg" alt="Logo" class="h-8 w-8" />
          </span> 
          <!--neat little gradient using tailwinds -->
          <span class="bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-red-400">TaskCentral</span> 
        </router-link>
      </div>
    </nav>
    
    <div class="flex-grow flex flex-col lg:flex-row">
      <main class="flex-grow px-6 pb-12 min-w-0">
        <div class="max-w-5xl mx-auto lg:mx-0 xl:mx-auto">
          <router-view v-slot="{ Component }">
            <!-- spiffy page transitions, the translate is a little much, but it's fun. -->
            <transition 
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-4"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
      <PrioritySidebar />
    </div>
  </div>
</template>

<script setup>
import PrioritySidebar from './components/PrioritySidebar.vue';
</script>
