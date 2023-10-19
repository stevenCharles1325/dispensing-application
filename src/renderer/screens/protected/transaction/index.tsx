/* eslint-disable react/no-unstable-nested-components */
import { useQuery } from '@tanstack/react-query';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ItemCard from 'UI/components/Cards/ItemCard';
import useAlert from 'UI/hooks/useAlert';
import useSearch from 'UI/hooks/useSearch';
import { AutoSizer, List } from 'react-virtualized';

const CARD_WIDTH = 250;
const CARD_HEIGHT = 350;

const getItems = async (searchText = ''): Promise<IPagination<ItemDTO>> => {
  const res = await window.item.getItems({ name: searchText }, 0, 'max');

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as IPagination<ItemDTO>;
};

export default function Transaction() {
  const { displayAlert } = useAlert();
  const { searchText, setSearchText } = useSearch();

  const { data, refetch: refetchItems } = useQuery({
    queryKey: ['items', searchText],
    queryFn: async () => {
      const res = await getItems(searchText);

      return res;
    },
  });

  const items = (data?.data as ItemDTO[]) ?? [];

  console.log(items);
  return (
    <div className="w-full h-full flex">
      <div className="grow">
        <AutoSizer>
          {({ height, width }) => {
            const cardsPerRow = Math.floor(width / CARD_WIDTH) || 1;

            const rowCount = Math.ceil(items.length / cardsPerRow);

            return (
              <div>
                <List
                  width={width}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={CARD_HEIGHT}
                  rowRenderer={({ index, key, style }) => {
                    const cards = [];
                    const fromIndex = index * cardsPerRow;
                    const toIndex = Math.min(
                      fromIndex + cardsPerRow,
                      items.length
                    );

                    // eslint-disable-next-line no-plusplus, @typescript-eslint/no-shadow
                    for (let i = fromIndex; index < toIndex; i++) {
                      const card = items[i];

                      cards.push(
                        <div key={i}>
                          <ItemCard cardInfo={card} />
                        </div>
                      );
                    }

                    return (
                      <div key={key} style={style}>
                        {cards}
                      </div>
                    );
                  }}
                />
              </div>
            );
          }}
        </AutoSizer>
      </div>
      <div className="w-[500px] h-full bg-black">Tae</div>
    </div>
  );
}
