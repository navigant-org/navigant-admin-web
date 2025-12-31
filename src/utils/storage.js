export const KEYS = {
    AUTH_TOKEN: 'navigant_auth_token',
    MAP_IMAGE: 'navigant_map_image',
    NODES: 'navigant_nodes',
    EDGES: 'navigant_edges',
    SCALE_RATIO: 'navigant_scale_ratio',
    BUILDINGS: 'navigant_buildings',
    FLOORS: 'navigant_floors',
};

const storage = {
    save: (key, value) => {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    },

    load: (key, defaultValue = null) => {
        try {
            const serializedValue = localStorage.getItem(key);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue);
        } catch (error) {
            console.error(`Error loading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    },

    clearAll: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

export default storage;
