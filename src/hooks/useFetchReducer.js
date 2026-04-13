import { useReducer } from 'react';

const initialFetchState = { items: [], loading: true, error: null };

function fetchReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { items: [], loading: true, error: null };
    case 'success':
      return { items: action.items, loading: false, error: null };
    case 'error':
      return { items: [], loading: false, error: action.error };
    default:
      return state;
  }
}

export const useFetchReducer = () => {
  const [state, dispatch] = useReducer(fetchReducer, initialFetchState);
  return [state, dispatch];
};
