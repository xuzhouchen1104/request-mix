import { BaseOptions } from './../types/options';
import { Mutate, Query, State, UnwrapRefs } from '../types/request';
import { Ref, ref } from 'vue';
import { HttpRequestResult } from '../types/request';
import { isFunction, setStateRelation } from '../utils';
import { CACHE } from '../utils/cache';
import { DEFAULT_PARALLEL_KEY, DEFAULT_CACHE_TIME } from '../utils/cons';

export const createHttpRequest = <P extends unknown[], R>(
  query: Query<P, R>,
  option: BaseOptions<P, R>,
  initialData?: Partial<UnwrapRefs<State<P, R>>>,
): HttpRequestResult<P, R> => {
  const loading = ref(initialData?.loading ?? false);
  const error = ref(initialData?.error ?? null);
  const data = <Ref<R>>ref(initialData?.data ?? null);
  const params = <Ref<P>>ref(initialData?.params ?? null);

  const setState = setStateRelation<P, R>(
    {
      loading,
      error,
      data,
      params,
    },
    (state) => {
      const cacheKey = option?.cacheKey ?? '';
      const cacheTime = option?.cacheTime ?? DEFAULT_CACHE_TIME;
      const parallelKey = option?.parallelKey?.(...state.params.value) ?? DEFAULT_PARALLEL_KEY;
      CACHE.update(cacheKey, state, cacheTime, parallelKey);
    },
  );

  const load = (...args: P) => {
    setState({
      loading: true,
      error: null,
      data: null,
      params: args,
    });

    return query(...args)
      .then((res) => {
        const result = res;
        setState({
          data: result,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        setState({
          data: null,
          loading: false,
          error: error,
        });
      });
  };

  const mutate: Mutate<R> = (value) => {
    const newData = isFunction(value) ? value(data.value) : value;
    setState({
      data: newData,
    });
  };

  return {
    loading,
    error,
    params,
    data,
    load,
    mutate,
  };
};
