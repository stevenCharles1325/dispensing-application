/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable no-plusplus */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unstable-nested-components */
import { Button, Chip, IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ItemCard from 'UI/components/Cards/ItemCard';
import useAlert from 'UI/hooks/useAlert';
import useSearch from 'UI/hooks/useSearch';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { AutoSizer, List } from 'react-virtualized';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import POSMenu from 'UI/components/Menu/PosMenu';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import { IOrderDetails } from 'App/interfaces/pos/pos.order-details.interface';
import PaymentDTO from 'App/data-transfer-objects/payment.dto';
import PaymentUISwitch from 'UI/components/Switches/PaymentSwitch';
import BarcodeIndicator from 'UI/components/Indicators/BarcodeIndicator';

const CARD_WIDTH = 325;
const CARD_HEIGHT = 460;

const getItems = async (
  searchText = '',
  categoryIds: Array<number>
): Promise<IPagination<ItemDTO>> => {
  const res = await window.item.getItems(
    { name: searchText, category_id: categoryIds },
    0,
    'max'
  );

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    console.log(errorMessage);

    return {
      data: [],
      total: 0,
      totalPage: 0,
      currentPage: 0,
      previousPage: 0,
      nextPage: 0,
    }
  }

  return res.data as IPagination<ItemDTO>;
};

const getCategories = async (): Promise<IPagination<CategoryDTO>> => {
  const res = await window.category.getCategories('all', 0, 'max');

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    console.log(errorMessage);

    return {
      data: [],
      total: 0,
      totalPage: 0,
      currentPage: 0,
      previousPage: 0,
      nextPage: 0,
    }
  }

  return res.data as unknown as IPagination<CategoryDTO>;
};

export default function Home() {
  const { displayAlert } = useAlert();
  const { searchText, setPlaceHolder } = useSearch();
  const [selectedItemIds, setSelectedItemIds] = useState<Array<string>>([]);
  const [orders, setOrders] = useState<Record<string, number>>({});
  const [posMenuAnchorEl, setPosMenuAnchorEl] = useState<HTMLElement | null>();
  const [categoryIds, setCategoryIds] = useState<Array<number>>([]);

  // Payment switch
  const [checked, setChecked] = useState(false);
  const selectedPaymentMethod = checked ? 'card' : 'cash';

  const { data, refetch: refetchItems } = useQuery({
    queryKey: ['items', searchText, categoryIds],
    queryFn: async () => {
      const res = await getItems(searchText, categoryIds);

      return res;
    },
  });

  const { data: categs } = useQuery({
    queryKey: ['categories', searchText],
    queryFn: async () => {
      const res = await getCategories();

      return res;
    },
  });

  const items = useMemo(() => {
    return (
      data?.data.filter(({ name }) =>
        name.toLowerCase().includes(searchText?.toLowerCase() ?? '')
      ) ?? []
    );
  }, [data, searchText]);

  const categories = useMemo(
    () => (categs?.data as CategoryDTO[]) ?? [],
    [categs]
  );

  const selectedItems = useMemo(() => {
    if (items && items.length && selectedItemIds.length) {
      return items.filter(({ id }) => selectedItemIds.includes(id));
    }

    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemIds]);

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

  const total = subTotal + tax;

  const orderDetails: IOrderDetails = useMemo(
    () => ({
      items: selectedItems.map(({ id, tax_rate, selling_price }) => ({
        id,
        quantity: orders[id],
        tax_rate,
        selling_price,
      })),
      total,
      payment_method: selectedPaymentMethod,
      discount: 0, // To be included soon
    }),
    [selectedItems, total, selectedPaymentMethod, orders]
  );

  const handlePurchaseItem = useCallback(async () => {
    if (!orderDetails.items.length) {
      return displayAlert?.('No item to be purchased', 'error');
    }

    const res = await window.payment.createPayment(orderDetails);

    if (res.status === 'ERROR') {
      const errorMessage = res.errors?.[0] as unknown as string;
      return displayAlert?.(errorMessage, 'error');
    }

    setSelectedItemIds([]);
    setOrders({});
    refetchItems();
    displayAlert?.('Purchased successfully', 'success');
    return res.data as unknown as IPagination<PaymentDTO>;
  }, [orderDetails, displayAlert, refetchItems]);

  const handleSelectItem = useCallback(
    (id: string) => {
      if (selectedItemIds.includes(id)) {
        setOrders((userOrders) => ({
          ...userOrders,
          [id]: userOrders[id] + 1,
        }));

        return;
      };

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

  const handleSelectItemByBarcode = useCallback(
    (itemBarcode: string) => {
      const item = items.find(({ barcode }) => barcode === itemBarcode);

      if (item) {
        if (selectedItemIds.includes(item.id)) {
          setOrders((userOrders) => ({
            ...userOrders,
            [item.id]: userOrders[item.id] += 1,
          }));
        } else {
          setSelectedItemIds((selectedIds) =>
            [...selectedIds, item.id]
          );

          setOrders((userOrders) => ({
            ...userOrders,
            [item.id]: 1,
          }));
        }
      } else {
        displayAlert?.(`Unable to find item with code ${itemBarcode}`, 'error');
      }
    },
    [items, selectedItemIds, displayAlert]
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
            <ItemCard
              cardInfo={card}
              orderNumber={orders[card.id] ?? 0}
              onSelect={handleSelectItem}
            />
          </div>
        );
      }

      return (
        <div className="flex flex-row flex-wrap gap-3" key={key} style={style}>
          {cards}
        </div>
      );
    },
    [handleSelectItem, items, orders]
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setPosMenuAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    setPlaceHolder?.('Search for product name');
  }, [setPlaceHolder]);

  useEffect(() => {
    window.main.mainMessage((_, payload) => {
      if (payload.channel === 'BARCODE:DATA') {
        handleSelectItemByBarcode(payload.data);
      }

      if (payload.channel === 'BARCODE:ERROR') {
        displayAlert?.(payload.data, 'error');
      }
    })
  }, [displayAlert, handleSelectItemByBarcode]);

  return (
    <>
      <div className="w-full h-full flex">
        <div className="grow min-w-[800px] flex flex-col">
          <div className="w-full h-[50px] flex flex-row gap-3">
            <Chip
              label="Category"
              icon={<ExpandMoreIcon />}
              color="secondary"
              variant="outlined"
              onClick={handleFilterClick}
              className="shadow-md border"
            />
            <BarcodeIndicator />
          </div>
          <div className="grow">
            {items?.length ? (
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
            ) : (
              <div
                className="w-full text-sm text-center py-5"
                style={{ color: 'var(--info-text-color)' }}
              >
                No available items
              </div>
            )}
          </div>
        </div>
        <div className="min-w-[320px] w-[450px] max-w-[450px] h-full p-3">
          <div
            className="min-w-[320px] max-w-full h-full rounded-md border p-3 shadow-lg flex flex-col overflow-auto"
            style={{ backgroundColor: 'var(--bg-color)' }}
          >
            <div className="grow overflow-auto flex flex-col gap-2">
              <b style={{ color: 'white' }}>ORDERS</b>
              <div className="flex flex-col h-fit gap-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-full w-full h-[80px] shadow-md rounded-md flex flex-row overflow-hidden"
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
                        onClick={() =>
                          handleIterateOrderQuantity('add', item.id)
                        }
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

                <div className="flex flex-row justify-between">
                  <div>
                    <p>Payment Method:</p>
                    {/* <div className="flex flex-row justify-start items-center">
                      <p className="text-sm text-gray-600">Cash</p>
                      <PaymentUISwitch
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            displayAlert?.(
                              'Card payment is temporarily unavailable',
                              'error'
                            );
                          } else {
                            setChecked(e.target.checked);
                          }
                        }}
                      />
                      <p className="text-sm text-gray-600">Card</p>
                    </div> */}
                  </div>
                  <div>
                    <p className="capitalize">{selectedPaymentMethod}</p>
                  </div>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  sx={{ color: 'black' }}
                  onClick={() => handlePurchaseItem()}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <POSMenu
        list={categories}
        anchorEl={posMenuAnchorEl}
        open={Boolean(posMenuAnchorEl)}
        onChange={(ids) => setCategoryIds(ids as Array<number>)}
        onClose={() => setPosMenuAnchorEl(null)}
      />
    </>
  );
}
