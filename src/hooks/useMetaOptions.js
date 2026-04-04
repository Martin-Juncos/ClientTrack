import { useCallback, useEffect, useRef, useState } from "react";
import { metaApi } from "../lib/api/metaApi.js";

let cachedOptions = null;
let inflightRequest = null;

async function fetchMetaOptions(force = false) {
  if (cachedOptions && !force) {
    return cachedOptions;
  }

  if (!inflightRequest || force) {
    inflightRequest = metaApi
      .getOptions()
      .then((data) => {
        cachedOptions = data;
        return data;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }

  return inflightRequest;
}

export function useMetaOptions() {
  const isMountedRef = useRef(true);
  const [state, setState] = useState({
    data: cachedOptions,
    loading: !cachedOptions,
    error: null
  });

  const loadOptions = useCallback(async (force = false) => {
    let result = null;

    if (cachedOptions && !force) {
      if (isMountedRef.current) {
        setState({
          data: cachedOptions,
          loading: false,
          error: null
        });
      }

      return cachedOptions;
    }

    if (isMountedRef.current) {
      setState((current) => ({
        data: current.data ?? cachedOptions,
        loading: true,
        error: null
      }));
    }

    try {
      result = await fetchMetaOptions(force);

      if (isMountedRef.current) {
        setState({
          data: result,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState((current) => ({
          data: current.data ?? cachedOptions,
          loading: false,
          error
        }));
      }
    }

    return result;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    loadOptions().catch(() => {});

    return () => {
      isMountedRef.current = false;
    };
  }, [loadOptions]);

  return {
    ...state,
    reload: () => loadOptions(true)
  };
}
