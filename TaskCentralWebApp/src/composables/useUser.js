import { ref } from 'vue';
import { userService } from '../services/api';

const currentUser = ref(localStorage.getItem('currentUser') || 'default');
const availableUsers = ref([]);
const isLoadingUsers = ref(false);
const showCreateUserModal = ref(false);

export function useUser() {
    const fetchUsers = async () => {
        isLoadingUsers.value = true;
        try {
            const response = await userService.getUsers();
            availableUsers.value = response.data;

            // If no users exist, prompt to create one
            if (availableUsers.value.length === 0) {
                showCreateUserModal.value = true;
            }
            // If current user is not in the list (and list is not empty), default to first user or keep 'default' if it exists
            else if (!availableUsers.value.find(u => u.id === currentUser.value)) {
                // Try to fallback to 'default' if it exists in the list
                if (availableUsers.value.find(u => u.id === 'default')) {
                    switchUser('default');
                } else {
                    // Otherwise just pick the first one
                    switchUser(availableUsers.value[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            isLoadingUsers.value = false;
        }
    };

    const createUser = async (name) => {
        // Simple ID generation: lowercase, remove spaces
        const id = name.toLowerCase().replace(/\s+/g, '');

        try {
            const newUser = { id, name };
            await userService.createUser(newUser);
            await fetchUsers(); // Refresh list
            switchUser(id); // Switch to new user
            showCreateUserModal.value = false;
            return true;
        } catch (error) {
            console.error('Failed to create user:', error);
            return false;
        }
    };

    const switchUser = (userId) => {
        currentUser.value = userId;
        localStorage.setItem('currentUser', userId);
        // We might want to reload to refresh all data, or we can rely on reactivity if we set it up right.
        // For now, reloading is safer to ensure all Axios interceptors and components catch up.
        // However, if we do it inside createUser it might be jarring. 
        // Let's stick to reload for explicit switches, but maybe not for initial load.
        if (window.location.reload) {
            window.location.href = '/';
        }
    };

    const promptCreateUser = () => {
        showCreateUserModal.value = true;
    };

    return {
        currentUser,
        availableUsers,
        isLoadingUsers,
        showCreateUserModal,
        fetchUsers,
        createUser,
        switchUser,
        promptCreateUser
    };
}
