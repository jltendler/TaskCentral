import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { todoListService } from '../services/api';

export function useTodoLists() {
    const router = useRouter();
    const lists = ref([]);
    const loading = ref(true);
    const showAddModal = ref(false);
    const newList = ref({ name: '' });
    const listIdDeleting = ref(null);

    const fetchLists = async () => {
        loading.value = true;
        try {
            const response = await todoListService.getLists();
            lists.value = response.data;
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            loading.value = false;
        }
    };

    const createList = async (name) => {
        const listName = typeof name === 'string' ? name : newList.value.name;
        if (!listName) return;
        try {
            await todoListService.createList({ name: listName });
            newList.value.name = '';
            showAddModal.value = false;
            await fetchLists();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const requestDelete = (id) => {
        listIdDeleting.value = id;
    };

    const cancelDelete = () => {
        listIdDeleting.value = null;
    };

    const deleteList = async (id) => {
        try {
            await todoListService.deleteList(id);
            listIdDeleting.value = null;
            await fetchLists();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const goToList = (id) => {
        router.push({ name: 'todolist', params: { id } });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // If the date string doesn't have a timezone indicator, assume it's UTC and append 'Z'
        // Since we control the data this isn't necessary, but it's a good inclusion for futureproofing.
        const utcString = (dateString.includes('Z') || dateString.includes('+'))
            ? dateString
            : `${dateString}Z`;
        // I dislike the undefined here, but that's the MDN-blessed 'default to local' option. Eww.
        return new Date(utcString).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };


    onMounted(fetchLists);

    return {
        lists,
        loading,
        showAddModal,
        newList,
        listIdDeleting,
        fetchLists,
        createList,
        requestDelete,
        cancelDelete,
        deleteList,
        goToList,
        formatDate
    };
}
