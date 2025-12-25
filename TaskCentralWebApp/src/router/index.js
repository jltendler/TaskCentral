import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TodoListView from '../views/TodoListView.vue';

//Using router to let us navigate to lists directly so a user could bookmark a list and return to it
//Would be nice to support listName or something else more human readable in the future
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/list/:id',
            name: 'todolist',
            component: TodoListView,
            props: true,
        },
    ],
});

export default router;
