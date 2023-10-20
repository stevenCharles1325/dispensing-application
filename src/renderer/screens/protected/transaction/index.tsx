/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable no-plusplus */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unstable-nested-components */
import { Button, IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ItemCard from 'UI/components/Cards/ItemCard';
import useAlert from 'UI/hooks/useAlert';
import useSearch from 'UI/hooks/useSearch';
import { useCallback, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { AutoSizer, List } from 'react-virtualized';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CARD_WIDTH = 325;
const CARD_HEIGHT = 460;

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
  const [selectedItemIds, setSelectedItemIds] = useState<Array<string>>([]);
  const [orders, setOrders] = useState<Record<string, number>>({});

  const { data, refetch: refetchItems } = useQuery({
    queryKey: ['items', searchText],
    queryFn: async () => {
      const res = await getItems(searchText);

      return res;
    },
  });

  const items = useMemo(() => (data?.data as ItemDTO[]) ?? [], [data]);

  const selectedItems = useMemo(() => {
    if (items && items.length && selectedItemIds.length) {
      return items.filter(({ id }) => selectedItemIds.includes(id));
    }

    return [];
  }, [items, selectedItemIds]);

  const subTotal = useMemo(() => {
    const ids = Object.keys(orders);

    if (ids.length) {
      return selectedItems.reduce((prev, curr) => {
        const quantity = orders[curr.id];

        return prev + curr.selling_price * quantity;
      }, 0);
    }

    return 0;
  }, [selectedItems, orders]);

  const computedTax = selectedItems.reduce((prev, curr) => {
    return prev + curr.tax_rate;
  }, 0);

  const tax = useMemo(() => {
    if (selectedItems.length) {
      return subTotal * (computedTax / 100);
    }

    return 0;
  }, [computedTax, selectedItems.length, subTotal]);

  const total = subTotal - tax;

  const handleSelectItem = useCallback(
    (id: string) => {
      if (selectedItemIds.includes(id)) return;

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: 1,
      }));

      setSelectedItemIds((selectedIds) => {
        return [...selectedIds, id];
      });
    },
    [selectedItemIds]
  );

  const handleIterateOrderQuantity = (
    action: 'add' | 'minus' = 'add',
    id: string
  ) => {
    if (action === 'add') {
      setOrders((userOrders) => ({
        ...userOrders,
        [id]: userOrders[id] + 1,
      }));
    }

    if (action === 'minus') {
      if (orders[id] - 1 <= 0) {
        const tempOrders = orders;

        if (orders[id] - 1 <= 0) {
          delete tempOrders[id];
          const filteredSelectedIds = selectedItemIds.filter(
            (itemId) => itemId !== id
          );

          setSelectedItemIds(filteredSelectedIds);
          return setOrders(tempOrders);
        }
      }

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: userOrders[id] - 1,
      }));
    }
  };

  const rowRenderer = useCallback(
    ({ index, key, style, cardsPerRow }: Record<string, any>) => {
      const cards = [];
      const fromIndex = index * cardsPerRow;
      const toIndex = Math.min(fromIndex + cardsPerRow, items.length);

      // eslint-disable-next-line no-plusplus, @typescript-eslint/no-shadow
      for (let i = fromIndex; i < toIndex; i++) {
        const card = items[i];

        cards.push(
          <div key={i}>
            <ItemCard cardInfo={card} onSelect={handleSelectItem} />
          </div>
        );
      }

      return (
        <div className="flex flex-row flex-wrap gap-3" key={key} style={style}>
          {cards}
        </div>
      );
    },
    [handleSelectItem, items]
  );

  return (
    <div className="w-full h-full flex">
      <div className="grow min-w-[800px]">
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
                  rowRenderer={(params) =>
                    rowRenderer({ ...params, cardsPerRow })
                  }
                />
              </div>
            );
          }}
        </AutoSizer>
      </div>
      <div className="w-[450px] h-full p-3">
        <div
          className="w-full h-full rounded-md border p-3 shadow-lg flex flex-col overflow-auto"
          style={{ backgroundColor: 'var(--bg-color)' }}
        >
          <div className="grow overflow-auto flex flex-col gap-2">
            <b style={{ color: 'white' }}>ORDERS</b>
            <div className="flex flex-col h-fit gap-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full h-[80px] shadow-md rounded-md flex flex-row overflow-hidden"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="min-w-[80px] w-[80px] h-full">
                    <img
                      src={item.image?.url}
                      alt={item.image?.name}
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '80px',
                        height: '80px',
                      }}
                    />
                  </div>
                  <div className="shrink min-w-[100px] p-2 capitalize">
                    <b>{item.name}</b>
                    <br />
                    <NumericFormat
                      className="mb-2 px-1 bg-transparent"
                      value={item.selling_price}
                      prefix="₱ "
                      thousandSeparator
                      valueIsNumericString
                      disabled
                    />
                  </div>
                  <div className="min-w-[100px] w-[100px] max-w-fit h-[80px] flex flex-row justify-center items-center">
                    <IconButton
                      disabled={orders[item.id] <= 0}
                      onClick={() =>
                        handleIterateOrderQuantity('minus', item.id)
                      }
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <input
                      className="input-number-hidden-buttons bg-transparent min-w-[30px] w-fit text-center"
                      value={orders[item.id]}
                      max={item.stock_quantity}
                      min={0}
                      type="number"
                      onChange={(e) =>
                        setOrders((userOrders) => ({
                          ...userOrders,
                          [item.id]: Number(e.target.value),
                        }))
                      }
                    />
                    <IconButton
                      disabled={orders[item.id] >= item.stock_quantity}
                      onClick={() => handleIterateOrderQuantity('add', item.id)}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-[350px] flex flex-col text-white">
            <br />
            <b style={{ color: 'white' }}>BILL</b>
            <div className="flex flex-row justify-between">
              <p>Sub-total:</p>
              <div>
                <NumericFormat
                  className="mb-2 px-1 bg-transparent grow text-end"
                  value={subTotal}
                  prefix="₱ "
                  thousandSeparator
                  valueIsNumericString
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <p>{`Tax ${tax ? `${computedTax}%` : ''} (VAT included):`}</p>
              <div>
                <NumericFormat
                  className="mb-2 px-1 bg-transparent grow text-end"
                  value={tax}
                  prefix="₱ "
                  thousandSeparator
                  valueIsNumericString
                  disabled
                />
              </div>
            </div>
            <br />
            <div className="grow w-full border-dashed border-t-4 py-3 flex flex-col justify-between">
              <div className="flex flex-row justify-between">
                <p>Total:</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={total}
                    prefix="₱ "
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div>

              <Button
                fullWidth
                variant="contained"
                color="inherit"
                sx={{ color: 'black' }}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
