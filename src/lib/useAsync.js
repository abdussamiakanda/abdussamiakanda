import { useEffect, useState } from 'react';

// Runs an async loader and tracks its result. Loaders here read local JSON,
// so this mostly exists to keep the async dataService API uniform.
export default function useAsync(loader, deps = [], initial = null) {
  const [state, setState] = useState({ data: initial, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => {
        console.error(error);
        if (alive) setState({ data: initial, loading: false, error });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
