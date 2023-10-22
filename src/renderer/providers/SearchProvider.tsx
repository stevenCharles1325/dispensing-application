import React, { createContext, useMemo, useState } from 'react';
import str from 'string-sanitizer';

interface ISearchContext {
  searchText: string;
  setSearchText: (text: string) => void;
}

export const SearchContext = createContext<Partial<ISearchContext>>({});

export default function SearchProvider({ children }: React.PropsWithChildren) {
  const [searchText, setSearchText] = useState('');

  const handleSearchText = (text: string) => {
    const txt = str.sanitize.keepSpace(text);
    setSearchText(txt);
  };

  const value = useMemo(
    () => ({
      searchText,
      setSearchText: handleSearchText,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchText]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
