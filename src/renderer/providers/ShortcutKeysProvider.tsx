import { useQuery } from '@tanstack/react-query';
import ShortcutKeyDTO from 'App/data-transfer-objects/shortcut-key.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import hotkeys from 'hotkeys-js';
import React, {
  useMemo,
  useState,
  useCallback,
  createContext,
  useEffect,
} from 'react';

type ShortcutKeyData = {
  key: string;
  handler: () => void;
};

interface ShortcutKeyDTOHandler extends ShortcutKeyDTO {
  handler?: () => void;
};

interface IShortcutKeyContext {
  addListener: (data: ShortcutKeyData | ShortcutKeyData[]) => void;
  reset: () => void;
  getCommand: (key: string) => string;
  refresh: () => void;
}

export const ShortcutKeysContext = createContext<Partial<IShortcutKeyContext>>({});

export default function ShortcutKeysProvider({ children }: React.PropsWithChildren) {
  const errorHandler = useErrorHandler();
  const [shortcutKeys, setShortcutKeys] = useState<Record<string, () => void>>(
    {}
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shortcut-keys'],
    queryFn: async () => {
      const res = await window.shortcutKey.getShortcutkeys();

      if (res.errors) {
        errorHandler({
          errors: res.errors,
        });

        return {
          data: [],
          total: 0,
          totalPage: 0,
          currentPage: 0,
          previousPage: 0,
          nextPage: 0,
        };
      }

      return res.data as IPagination<ShortcutKeyDTO>;
    }
  });

  const keys = data?.data as ShortcutKeyDTO[] ?? [];
  const mergedKeysAndHandlers: ShortcutKeyDTOHandler[] = useMemo(() => {
    return keys.map((data) => ({
      ...data,
      handler: shortcutKeys[data.key],
    }));
  }, [shortcutKeys, keys]);

  const addListener = useCallback((data: ShortcutKeyData | ShortcutKeyData[]) => {
    if (Array.isArray(data)) {
      data.forEach((datum) => {
        setShortcutKeys((keys) => ({
          ...keys,
          [datum.key]: datum.handler,
        }));
      })
    } else {
      setShortcutKeys((keys) => ({
        ...keys,
        [data.key]: data.handler,
      }));
    }
  }, [shortcutKeys]);

  const reset = useCallback(() => {
    if (mergedKeysAndHandlers.length && !isLoading) {
      mergedKeysAndHandlers.forEach((data) => {
        hotkeys.unbind(data.key_combination);
      });
    }
  }, [mergedKeysAndHandlers]);

  const getCommand = useCallback((key: string) => {
    return keys.find((data) => data.key === key)?.key_combination ?? '';
  }, [keys]);

  const value = useMemo(
    () => ({
      addListener,
      reset,
      getCommand,
      refresh: refetch,
    }),
    [addListener, shortcutKeys]
  );

  useEffect(() => {
    if (mergedKeysAndHandlers.length && !isLoading) {
      mergedKeysAndHandlers.forEach((data) => {
        hotkeys.unbind(data.key_combination);

        hotkeys(data.key_combination, (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          data?.handler?.();

          return false;
        });
      });
    }

    return () => reset();
  }, [mergedKeysAndHandlers, isLoading]);

  return (
    <ShortcutKeysContext.Provider value={value}>
      {children}
    </ShortcutKeysContext.Provider>
  );
}
