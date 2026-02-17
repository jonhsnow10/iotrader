// Mock AsyncStorage for web using localStorage
// This is needed because @react-native-async-storage/async-storage is a React Native package
// that gets pulled in as a transitive dependency but doesn't work in web environments

const AsyncStorage = {
  getItem: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  mergeItem: (key, value) => {
    try {
      const existing = localStorage.getItem(key);
      const merged = existing ? JSON.stringify({ ...JSON.parse(existing), ...JSON.parse(value) }) : value;
      localStorage.setItem(key, merged);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getAllKeys: () => {
    try {
      const keys = Object.keys(localStorage);
      return Promise.resolve(keys);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  multiGet: (keys) => {
    try {
      const result = keys.map((key) => [key, localStorage.getItem(key)]);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  multiSet: (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  multiRemove: (keys) => {
    try {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  multiMerge: (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        const existing = localStorage.getItem(key);
        const merged = existing ? JSON.stringify({ ...JSON.parse(existing), ...JSON.parse(value) }) : value;
        localStorage.setItem(key, merged);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  flushGetRequests: () => {
    // No-op for web
    return Promise.resolve();
  },
};

// Hook for React components
export function useAsyncStorage(key) {
  return {
    getItem: (...args) => AsyncStorage.getItem(key, ...args),
    setItem: (...args) => AsyncStorage.setItem(key, ...args),
    removeItem: (...args) => AsyncStorage.removeItem(key, ...args),
    mergeItem: (...args) => AsyncStorage.mergeItem(key, ...args),
  };
}

export default AsyncStorage;

