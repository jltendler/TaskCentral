import { ref } from 'vue';
import { userService } from '../services/api';

const currentUser = ref(parseInt(localStorage.getItem('currentUser')) || null);
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
            // This shouldn't happen without manual database modification since we can't delete users in the demo.
            else if (!availableUsers.value.find(u => u.id === currentUser.value)) {
                // Pick the first one
                switchUser(availableUsers.value[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            isLoadingUsers.value = false;
        }
    };

    const createUser = async (name) => {
        try {
            // ID is now handled by backend (int)
            const newUser = { name };
            const response = await userService.createUser(newUser);
            // Ideally backend returns the created user with ID

            await fetchUsers(); // Refresh list to get the new ID in the list

            // We need to find the user we just added. 
            // Since we don't have the ID from the simple list fetch necessarily ordered, 
            // we rely on the response from createUser if possible.
            // But userService.createUser returns axios response.

            // Fallback: finding the user by name (risky if duplicates allowed, but fine for MVP)
            // Or use the ID from the response
            if (response.data && response.data.id) {
                switchUser(response.data.id);
            } else {
                const created = availableUsers.value.find(u => u.name === name);
                if (created) switchUser(created.id);
            }

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
        // We might want to reload to refresh all data
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
