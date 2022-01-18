import { Ref, WatchSource } from 'vue';

export type BaseOptions<P extends unknown[], R> = Partial<{
  defaultParams: P;
  manual: boolean;
  parallelKey: (...arg: P) => string;
  ready: Ref<Boolean>;
  cacheKey: string;
  cacheTime: number;
  delayLoadingTime: number;
  refreshDeps: WatchSource<any>[];
}>;
