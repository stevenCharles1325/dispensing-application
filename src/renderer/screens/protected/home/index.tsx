/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable no-plusplus */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unstable-nested-components */
import { Autocomplete, Button, Chip, IconButton, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ItemCard from 'UI/components/Cards/ItemCard';
import useAlert from 'UI/hooks/useAlert';
import useSearch from 'UI/hooks/useSearch';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import POSMenu from 'UI/components/Menu/PosMenu';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import { IOrderDetails } from 'App/interfaces/pos/pos.order-details.interface';
import BarcodeIndicator from 'UI/components/Indicators/BarcodeIndicator';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import useConfirm from 'UI/hooks/useConfirm';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';
import { DeleteOutline } from '@mui/icons-material';
import getUOFSymbol from 'UI/helpers/getUOFSymbol';
import titleCase from 'UI/helpers/titleCase';
import usePrinter from 'UI/hooks/usePrinter';
import { NumericFormatProps, NumericFormat } from 'react-number-format';
import measurements from 'UI/data/defaults/unit-of-measurements';
import localStorage from 'UI/modules/storage';
import CustomAutoComplete from 'UI/components/TextField/CustomAutoComplete';
import transaction from 'Main/data/defaults/categories/transaction';
import { getTemplateForItemPrinting } from 'UI/helpers/getTemplate';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 215;

const getItems = async (
  searchText = '',
  categoryIds: Array<string>
): Promise<IPagination<ItemDTO>> => {
  const res = await window.item.getItems(
    {
      name: searchText,
      category_id: categoryIds,
      status: [
        'available',
        'expired',
        'on-hold',
        'discontinued',
        'awaiting-shipment',
      ]
    },
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

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PesoNumberFormat = React.forwardRef<NumericFormatProps, CustomProps>(
  function PesoNumberFormat(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        decimalScale={2}
        accept="enter"
        thousandSeparator
        valueIsNumericString
      />
    );
  }
);

const inputStyle = {
  '& .MuiSvgIcon-root': {
    color: 'white',
  },
  '& .MuiFormLabel-root': {
    color: 'white !important',
  },
  '& .MuiInput-input': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  '& .MuiInputBase-root:before': {
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
  },
  '& .MuiInputBase-root:after': {
    borderBottom: '1px solid rgba(255, 255, 255, 1)'
  }
};


type OrderType = {
  unit_of_measurement: string;
  quantity: number;
};

type WeightType = OrderType;

const weightsInit = {
  quantity: 0,
  unit_of_measurement: 'kilograms'
}

export default function Home() {
  const { print, printCustom } = usePrinter();
  const confirm = useConfirm();
  const { addListener, getCommand } = useShortcutKeys();
  const errorHandler = useErrorHandler();
  const { displayAlert } = useAlert();
  const { searchText, setPlaceHolder } = useSearch();
  const [selectedItemIds, setSelectedItemIds] = useState<Array<string>>([]);
  // const [payment, setPayment] = useState<number>(0);
  // const [addPayment, setAddPayment] = useState<boolean>(false);
  const [orders, setOrders] = useState<Record<string, OrderType>>({});
  const [posMenuAnchorEl, setPosMenuAnchorEl] = useState<HTMLElement | null>();
  const [categoryIds, setCategoryIds] = useState<Array<string>>([]);

  // const [addCoupon, setAddCoupon] = useState<boolean>(false);
  const [barcodeNumber, setBarcodeNumber] = useState<string | null>(null);
  const [productUsed, setProductUsed] = useState<string>('');
  const [productLotNumber, setProductLotNumber] = useState<string>('');
  const [tareWeight, setTareWeight] = useState<WeightType>(weightsInit);
  const [netWeight, setNetWeight] = useState<WeightType>(weightsInit);
  const [grossWeight, setGrossWeight] = useState<WeightType>(weightsInit);

  const weights = useMemo(() => {
    return {
      tare_weight: `${tareWeight.quantity} ${getUOFSymbol(tareWeight.unit_of_measurement)}`,
      net_weight: `${netWeight.quantity} ${getUOFSymbol(netWeight.unit_of_measurement)}`,
      gross_weight: `${grossWeight.quantity} ${getUOFSymbol(grossWeight.unit_of_measurement)}`,
    }
  }, [tareWeight, netWeight, grossWeight]);
  // const [couponCode, setCouponCode] = useState<string>('');
  // const [discount, setDiscount] = useState<DiscountDTO | null>(null);

  // Payment switch
  const [checked, setChecked] = useState(false);
  const selectedPaymentMethod = checked ? 'card' : 'cash';

  const hasOrders = Boolean(selectedItemIds.length);

  // const handleClearDiscount = () => {
  //   confirm?.('Are you sure you want to remove the coupon?', async (agreed) => {
  //     if (agreed) {
  //       setDiscount(null);
  //       setCouponCode('');
  //     }
  //   });
  // }

  // const handleAddCoupon = useCallback(async () => {
  //   const res = await window.discount.getDiscounts({
  //     coupon_code: couponCode,
  //   });

  //   if (res.status === 'ERROR') {
  //     errorHandler({
  //       errors: res.errors,
  //     });
  //     setDiscount(null);

  //     return;
  //   }

  //   const discounts = res.data as IPagination<DiscountDTO>;
  //   const desiredDiscount = discounts.data[0];

  //   if (!desiredDiscount) {
  //     setDiscount(null);
  //     displayAlert?.('coupon code does not exist', 'error');
  //   } else {
  //     if (desiredDiscount.status === 'active') {
  //       setDiscount(desiredDiscount);
  //       displayAlert?.('successfully applied coupon', 'success');

  //       setAddCoupon(false);
  //     } else {
  //       displayAlert?.(`coupon is ${desiredDiscount.status}`, 'error')
  //     }
  //   }
  // }, [couponCode]);

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

  // const subTotal = useMemo(() => {
  //   const ids = Object.keys(orders);

  //   if (ids.length) {
  //     return selectedItems.reduce((prev, curr) => {
  //       const quantity = orders[curr.id];

  //       return prev + (curr.discounted_selling_price ?? curr.selling_price) * quantity;
  //     }, 0);
  //   }

  //   return 0;
  // }, [selectedItems, orders]);

  // const computedTax = selectedItems.reduce((prev, curr) => {
  //   return prev + curr.tax_rate;
  // }, 0);

  // const tax = useMemo(() => {
  //   if (selectedItems.length) {
  //     return subTotal * (computedTax / 100);
  //   }

  //   return 0;
  // }, [computedTax, selectedItems.length, subTotal]);

  // const total = useMemo(() => {
  //   const price = subTotal + tax;

  //   if (!discount) return price;
  //   if (discount.discount_type === 'fixed-amount-off') {
  //     return price - discount.discount_value;
  //   }

  //   if (discount.discount_type === 'percentage-off') {
  //     return price - (price * (discount.discount_value / 100));
  //   }

  //   return price;
  // }, [discount, subTotal, tax]);

  // const change = total < 0
  //   ? 0
  //   : payment - total > 0
  //     ? payment - total
  //     : 0;

  const orderDetails: IOrderDetails = useMemo(
    () => ({
      items: selectedItems.map(({
        id,
        tax_rate,
        selling_price,
        discount_id,
        unit_of_measurement,
      }) => ({
        id,
        discount_id,
        quantity: orders[id]?.quantity ?? 1,
        unit_of_measurement: orders[id]?.unit_of_measurement ?? unit_of_measurement,
        tax_rate,
        selling_price,
      })),
      total: 0,
      product_used: productUsed,
      ...weights,
      product_lot_number: productLotNumber,
      payment_method: selectedPaymentMethod,
      amount_received: 0,
      change: 0,
    }),
    [
      orders,
      selectedItems,
      weights,
      productUsed,
      productLotNumber,
      selectedPaymentMethod,
    ]
  );

  // const handleAddPayment = useCallback(() => {
  //   if (hasOrders) {
  //     setAddPayment(true);
  //   }
  // }, [hasOrders]);

  const handleSelectItemByBarcode = useCallback((_, payload) => {
    if (
      payload.channel === 'BARCODE:DATA' &&
      payload.data?.length &&
      items?.length &&
      displayAlert
    ) {
      setBarcodeNumber(payload.data);
    }

    if (payload.channel === 'BARCODE:ERROR') {
      displayAlert?.(payload.data, 'error');
    }
  }, [items, displayAlert]);

  const handleCancelOrder = () => {
    confirm?.('Are you sure you want to cancel the orders?', async (agreed) => {
      if (agreed) {
        setSelectedItemIds([]);
        setTareWeight(weightsInit);
        setNetWeight(weightsInit);
        setGrossWeight(weightsInit);
        setOrders({});
        setProductUsed('');
        setProductLotNumber('');
        displayAlert?.('Successfully cancelled order', 'success');
      }
    });
  }

  const handlePurchaseItem = useCallback(async () => {
    if (!orderDetails.items.length) {
      return displayAlert?.('No item to be purchased', 'error');
    }

    confirm?.('Are you sure you want to purchase?', async (agreed) => {
      if (agreed) {
        const res = await window.payment.createPayment(orderDetails);

        if (res.status === 'ERROR') {
          const onError = (field: string | null, message: string) => {
            if (field) {
              const fieldName = titleCase(field.split('_').join(' '));
              displayAlert?.(`${fieldName} ${message.toLowerCase()}`, 'error');
            }
          }

          errorHandler({
            errors: res.errors,
            onError
          });

          return;
        }

        // const transaction = res.data as unknown as TransactionDTO;

        // setDiscount(null);
        // setCouponCode('');
        // setPayment(0);

        // Caching Product-used and Product-lot-number
        const productUsedCache = localStorage.getItem('RELEASE:PU') as string[] ?? [];
        const productLotNoCache: string[] = localStorage.getItem('RELEASE:PLN') as string[] ?? [];

        console.log(productUsedCache, productLotNoCache);

        const elementToLowerCased = (arr: string[]) => {
          return arr.map(str => str.toLocaleLowerCase());
        }

        if (
          !elementToLowerCased(productUsedCache)
          .includes(
            orderDetails.product_used.toLocaleLowerCase()
          )
        ) {
          productUsedCache.push(orderDetails.product_used);
          localStorage.setItem('RELEASE:PU', productUsedCache);
        }

        if (
          !elementToLowerCased(productLotNoCache)
          .includes(
            orderDetails.product_lot_number?.toLocaleLowerCase()
          )
        ) {
          productLotNoCache.push(orderDetails.product_lot_number);
          localStorage.setItem('RELEASE:PLN', productLotNoCache);
        }

        setTareWeight(weightsInit);
        setNetWeight(weightsInit);
        setGrossWeight(weightsInit);
        setProductUsed('');
        setProductLotNumber('');
        setSelectedItemIds([]);
        setOrders({});
        refetchItems();
        displayAlert?.('Purchased successfully', 'success');

        print(transaction.id);
      }
    });
  }, [orderDetails, displayAlert, refetchItems]);

  const handleSelectItem = useCallback(
    (id: string) => {
      const item = items.find(item => item.id === id);

      if (item || selectedItemIds.includes(id)) {
        setNetWeight((netWeight) => ({
          quantity: netWeight.quantity + 1,
          unit_of_measurement: item?.unit_of_measurement ?? netWeight.unit_of_measurement,
        }));
      }

      if (selectedItemIds.includes(id)) {
        setOrders((userOrders) => ({
          ...userOrders,
          [id]: {
            ...userOrders[id],
            quantity: userOrders[id].quantity + 1,
          },
        }));

        return;
      };

      if (item) {
        setOrders((userOrders) => ({
          ...userOrders,
          [id]: {
            quantity: 1,
            unit_of_measurement: item?.unit_of_measurement,
          },
        }));
      }

      setSelectedItemIds((selectedIds) => {
        return [...selectedIds, id];
      });
    },
    [selectedItemIds, items]
  );

  const handlePrintItem = useCallback((id: string) => {
    const item = items.find(item => item.id === id);

    if (item) {
      const data = getTemplateForItemPrinting(item);
      printCustom(data);
    }

    displayAlert?.('Cannot find selected item. Please try again!', 'error');
  }, [items, displayAlert]);

  // const handleSelectItemByBarcode = useCallback(
  //   (itemBarcode: string) => {
  //     const item = items.find(({ barcode }) => barcode === itemBarcode);

  //     if (item) {
  //       if (selectedItemIds.includes(item.id)) {
  //         setOrders((userOrders) => ({
  //           ...userOrders,
  //           [item.id]: {
  //             ...userOrders[item.id],
  //             quantity: userOrders[item.id].quantity + 1,
  //           },
  //         }));
  //       } else {
  //         setSelectedItemIds((selectedIds) =>
  //           [...selectedIds, item.id]
  //         );

  //         setOrders((userOrders) => ({
  //           ...userOrders,
  //           [item.id]: {
  //             unit_of_measurement: item.unit_of_measurement,
  //             quantity: userOrders[item.id].quantity + 1,
  //           },
  //         }));
  //       }
  //     } else {
  //       displayAlert?.(`Unable to find item with code ${itemBarcode}`, 'error');
  //     }
  //   },
  //   [items, selectedItemIds, displayAlert]
  // );

  const handleIterateOrderQuantity = (
    action: 'add' | 'minus' = 'add',
    id: string
  ) => {
    if (action === 'add') {
      setNetWeight((netWeight) => ({
        ...netWeight,
        quantity: netWeight.quantity + 1,
      }));

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: {
          ...userOrders[id],
          quantity: userOrders[id].quantity + 1,
        },
      }));
    }

    if (action === 'minus') {
      if (orders[id].quantity - 1 <= 0) {
        const tempOrders = orders;

        if (orders[id].quantity - 1 <= 0) {
          delete tempOrders[id];
          const filteredSelectedIds = selectedItemIds.filter(
            (itemId) => itemId !== id
          );

          setSelectedItemIds(filteredSelectedIds);
          return setOrders(tempOrders);
        }
      }

      setNetWeight((netWeight) => ({
        ...netWeight,
        quantity: netWeight.quantity - 1,
      }));

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: {
          ...userOrders[id],
          quantity: userOrders[id].quantity - 1,
        },
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
              orderNumber={orders[card.id]?.quantity ?? 0}
              onSelect={handleSelectItem}
              onPrint={handlePrintItem}
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
    if (addListener) {
      addListener([
        // {
        //   key: 'add-payment',
        //   handler: () => {
        //     if (hasOrders) handleAddPayment();
        //   },
        // },
        {
          key: 'place-order',
          handler: () => {
            if (hasOrders) handlePurchaseItem();
          },
        },
        {
          key: 'cancel-order',
          handler: () => {
            if (hasOrders) handleCancelOrder();
          },
        },
      ]);
    }
  },
  [
    hasOrders,
    handlePurchaseItem,
  ]);

  useEffect(() => {
    window.main.mainMessage(handleSelectItemByBarcode);
  }, [handleSelectItemByBarcode]);

  useEffect(() => {
    if (barcodeNumber && items.length) {
      const selectedProduct = items.find(
        ({ barcode }) =>
          barcode === barcodeNumber
        );

      if (selectedProduct) {
        if (selectedProduct.status !== 'available') {
          displayAlert?.(`Product with code ${barcodeNumber} is ${selectedProduct.status}`, 'error');
          return;
        }

        if (orders[selectedProduct.id]?.quantity + 1 > selectedProduct.stock_quantity) {
          displayAlert?.(
            `Product with code ${
              barcodeNumber
            } has only ${
              selectedProduct.stock_quantity
            } ${
              getUOFSymbol(selectedProduct.unit_of_measurement)
            }. available stock`,
            'error'
          );
          return;
        }

        handleSelectItem(selectedProduct.id);
        setBarcodeNumber(null);
        return;
      }

      if (!selectedProduct) {
        displayAlert?.(`Unable to find product with code ${barcodeNumber}`, 'error');
        return;
      }
    }
  }, [items, barcodeNumber, orders, handleSelectItem]);

  useEffect(() => {
    const leftOperand = {
      quantity: netWeight.quantity,
      unit: netWeight.unit_of_measurement,
    };

    const rightOperand = {
      quantity: tareWeight.quantity,
      unit: tareWeight.unit_of_measurement,
    };

    const getGrossQuantity = async () => {
      const res = await window.pos.unitQuantityCalculator(
        leftOperand,
        rightOperand,
        'add'
      );

      if (res.data) {
        const [quantity, um] = res.data;

        if (quantity && um) {
          setGrossWeight({
            quantity: quantity as number,
            unit_of_measurement: um as string,
          });
        }
      }
    };

    getGrossQuantity();
  }, [netWeight, tareWeight]);

  useEffect(() => {
    if (!selectedItemIds.length) {
      setProductUsed('');
      setProductLotNumber('');

      setTareWeight(weightsInit);
      setNetWeight(weightsInit);
      setGrossWeight(weightsInit);
    }
  }, [selectedItemIds]);

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
            />
            <BarcodeIndicator />
            {/* <PrinterIndicator /> */}
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
            <div className="grow flex flex-col gap-2">
              <div className="w-full h-fit flex flex-row justify-start align-center">
                <b style={{ color: 'white' }}>PRODUCTS</b>
                {/* <div className="w-fit h-fit">
                  <Chip
                    icon={<DiscountOutlined fontSize="small" sx={{ color: 'white' }} />}
                    label={
                      discount
                      ? (
                        discount.discount_type === 'fixed-amount-off'
                        ? `${discount.coupon_code} ₱${discount.discount_value} OFF`
                        : discount.discount_type === 'percentage-off'
                          ? `${discount.coupon_code} ${discount.discount_value}% OFF`
                          : ''
                      )
                      : "Add Coupon"
                    }
                    color="warning"
                    onClick={() => setAddCoupon(true)}
                    onDelete={discount ? handleClearDiscount : undefined}
                    deleteIcon={(
                      discount
                      ? <ClearOutlined sx={{ color: 'white' }} />
                      : undefined
                    )}
                    sx={{
                      color: 'white',
                    }}
                  />
                </div> */}
              </div>
              <div className='h-[50px] grow overflow-auto'>
                <div className="w-full h-fit flex flex-col h-fit gap-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-[98%] w-full h-fit shadow-md rounded-md flex flex-row overflow-hidden border border-transparent"
                      style={{ backgroundColor: 'white' }}
                    >
                      <div className="min-w-[80px] w-[80px] h-full relative">
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
                        <div className="absolute top-0 right-0 w-full h-full flex justify-center items-center bg-white/30">
                          <IconButton
                            onClick={() => {
                              confirm?.('Are you sure you want to remove this item?', async (agreed) => {
                                if (agreed) {
                                  const filteredOrders = Object.keys(orders)
                                    .filter(id => id !== item.id);

                                  const updatedOrders: Record<string, OrderType> = {};

                                  filteredOrders.forEach(id => {
                                    updatedOrders[id] = orders[id];
                                  });

                                  setOrders(updatedOrders);
                                  setSelectedItemIds(
                                    selectedItemIds.filter(id =>
                                      id !== item.id
                                    )
                                  );
                                }
                              });
                            }}
                          >
                            <DeleteOutline color="error" />
                          </IconButton>
                        </div>
                      </div>
                      <div className="grow min-w-[100px] p-2 capitalize">
                        <b className='truncate'>{item.name}</b>
                        <p className='truncate text-slate-500 text-sm'>
                          {item.batch_code}
                        </p>
                        <p className='truncate text-slate-500 text-sm'>
                          {item.unit_of_measurement}
                        </p>
                      </div>
                      <div className="absolute bg-white right-0 w-fit h-[80px] flex flex-row justify-center items-center">
                        <IconButton
                          disabled={orders[item.id].quantity <= 0}
                          onClick={() =>
                            handleIterateOrderQuantity('minus', item.id)
                          }
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                        <input
                          className="input-number-hidden-buttons bg-transparent w-[30px] w-fit text-center"
                          value={orders[item.id].quantity}
                          max={item.stock_quantity}
                          min={0}
                          type="number"
                          style={{
                            width: `${(orders[item.id].quantity?.toString().length * 10) + 40}px`
                          }}
                          onChange={(e) => {
                            setNetWeight((netWeight) => ({
                              ...netWeight,
                              quantity: Number(e.target.value) > item.stock_quantity
                                ? item.stock_quantity
                                : Number(e.target.value),
                            }));

                            setOrders((userOrders) => ({
                              ...userOrders,
                              [item.id]: {
                                unit_of_measurement: item.unit_of_measurement,
                                quantity: Number(e.target.value) > item.stock_quantity
                                  ? item.stock_quantity
                                  : Number(e.target.value),
                              },
                            }))
                          }}
                        />
                        <IconButton
                          disabled={orders[item.id].quantity >= item.stock_quantity}
                          onClick={() =>
                            handleIterateOrderQuantity('add', item.id)
                          }
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                  {!selectedItems.length ?
                  (
                    <div className="w-full h-[50px] flex text-white/50 justify-center items-center">
                      <p>Empty!</p>
                    </div>
                  )
                  : null}
                </div>
              </div>
            </div>
            <div className="w-full h-fit flex flex-col text-white">
              {/* <b style={{ color: 'white' }}>BILL</b> */}
              {/* <div className="flex flex-row justify-between">
                <p>Sub-total:</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={subTotal}
                    prefix="₱ "
                    decimalScale={2}
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div> */}
              {/* <div className="flex flex-row justify-between">
                <p>Discount:</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={
                      discount?.discount_type === 'fixed-amount-off'
                      ? discount.discount_value
                      : discount?.discount_type === 'percentage-off'
                        ? subTotal * (discount.discount_value / 100)
                        : 0
                    }
                    prefix="₱ "
                    decimalScale={2}
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div> */}
              {/* <div className="flex flex-row justify-between">
                <p>{`Tax ${tax ? `${computedTax}%` : ''} (VAT included):`}</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={tax}
                    prefix="₱ "
                    decimalScale={2}
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div> */}
              <div className="grow w-full border-t-4 pt-3 flex flex-col justify-between">
                <br />
                <div
                  className={`flex flex-col gap-5 mt-3 py-3 px-3 pb-5 border ${
                    !selectedItemIds.length
                    ? 'border-white/30'
                    : 'border-white'
                  } rounded`}
                >
                  <CustomAutoComplete
                    variant="standard"
                    fullWidth
                    disabled={!selectedItemIds.length}
                    value={productUsed}
                    required
                    options={(localStorage.getItem('RELEASE:PU') as string[] ?? [])
                      .map(value => ({ name: value }))}
                    onAdd={(value) => {
                      setProductUsed(value);
                    }}
                    onChange={({ name }) => {
                      setProductUsed(name);
                    }}
                    label="Product Used:"
                    inputSX={inputStyle}
                  />
                  <CustomAutoComplete
                    required
                    fullWidth
                    variant="standard"
                    value={productLotNumber}
                    disabled={!selectedItemIds.length}
                    options={(localStorage.getItem('RELEASE:PLN') as string[] ?? [])
                      .map(value => ({ name: value }))}
                    onAdd={(value) => {
                      setProductLotNumber(value);
                    }}
                    onChange={({ name }) => {
                      setProductLotNumber(name);
                    }}
                    label="Product Lot No.:"
                    inputSX={inputStyle}
                  />
                  <div className='flex'>
                    <TextField
                      disabled={!selectedItemIds.length}
                      label="Tare Weight:"
                      color="secondary"
                      size="small"
                      fullWidth
                      value={tareWeight.quantity}
                      variant="standard"
                      InputProps={{
                        inputComponent: PesoNumberFormat as any,
                      }}
                      onChange={(e) => {
                        setTareWeight((tareW) => ({
                          ...tareW,
                          quantity: Number(e.target.value),
                        }));
                      }}
                      sx={inputStyle}
                    />
                    <Autocomplete
                      fullWidth
                      disabled={!selectedItemIds.length}
                      options={measurements}
                      size="small"
                      value={tareWeight.unit_of_measurement}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          sx={inputStyle}
                          variant="standard"
                          label="Unit of Measurement"
                        />
                      }
                      onChange={(e, newValue) => {
                        setTareWeight((tareW) => ({
                          ...tareW,
                          unit_of_measurement: newValue ?? 'kilograms',
                        }));
                      }}
                    />
                  </div>
                  <div className='flex'>
                    <TextField
                      disabled={!selectedItemIds.length}
                      label="Net Weight:"
                      color="secondary"
                      value={netWeight.quantity}
                      size="small"
                      fullWidth
                      variant="standard"
                      InputProps={{
                        inputComponent: PesoNumberFormat as any,
                      }}
                      onChange={(e) => {
                        setNetWeight((netW) => ({
                          ...netW,
                          quantity: Number(e.target.value),
                        }));
                      }}
                      sx={inputStyle}
                    />
                    <Autocomplete
                      fullWidth
                      disabled={!selectedItemIds.length}
                      options={measurements}
                      size="small"
                      value={netWeight.unit_of_measurement}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          sx={inputStyle}
                          variant="standard"
                          label="Unit of Measurement"
                        />
                      }
                      onChange={(e, newValue) => {
                        setNetWeight((netW) => ({
                          ...netW,
                          unit_of_measurement: newValue ?? 'kilograms',
                        }));
                      }}
                    />
                  </div>
                  <div className='flex'>
                    <TextField
                      disabled={!selectedItemIds.length}
                      label="Gross Weight:"
                      color="secondary"
                      size="small"
                      fullWidth
                      variant="standard"
                      value={grossWeight.quantity}
                      InputProps={{
                        inputComponent: PesoNumberFormat as any,
                      }}
                      onChange={(e) => {
                        setGrossWeight((grossW) => ({
                          ...grossW,
                          quantity: Number(e.target.value),
                        }));
                      }}
                      sx={inputStyle}
                    />
                    <Autocomplete
                      disabled={!selectedItemIds.length}
                      fullWidth
                      options={measurements}
                      size="small"
                      value={grossWeight.unit_of_measurement}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          sx={inputStyle}
                          variant="standard"
                          label="Unit of Measurement"
                        />
                      }
                      onChange={(e, newValue) => {
                        setGrossWeight((grossW) => ({
                          ...grossW,
                          unit_of_measurement: newValue ?? 'kilograms',
                        }));
                      }}
                    />
                  </div>
                  {/*
                    <p>Total:</p>
                  <div>
                    <NumericFormat
                      className="mb-2 px-1 bg-transparent grow text-end"
                      value={total}
                      prefix="₱ "
                      decimalScale={2}
                      thousandSeparator
                      valueIsNumericString
                      disabled
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <p>Amount Received:</p>
                  <div>
                    <NumericFormat
                      className="mb-2 px-1 bg-transparent grow text-end"
                      value={payment}
                      prefix="₱ "
                      thousandSeparator
                      decimalScale={2}
                      valueIsNumericString
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between">
                  <p>Change:</p>
                  <div>
                    <NumericFormat
                      className="mb-2 px-1 bg-transparent grow text-end"
                      value={change}
                      prefix="₱ "
                      thousandSeparator
                      decimalScale={2}
                      valueIsNumericString
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between">
                  <div>
                    <p>Payment Method:</p>
                    <div className="flex flex-row justify-start items-center">
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
                    </div>
                  </div>
                  <div>
                    <p className="capitalize">{selectedPaymentMethod}</p>
                  </div>
                  */}
                </div>
                <br/>
                <div className='w-full mt-5 flex flex-col gap-2'>
                  <Button
                    fullWidth
                    disabled={!hasOrders}
                    variant="contained"
                    color="inherit"
                    sx={{ color: 'black' }}
                    onClick={() => handlePurchaseItem()}
                  >
                    {`Place order (${getCommand?.('place-order')})`}
                  </Button>
                  <Button
                    disabled={!hasOrders}
                    fullWidth
                    variant="text"
                    color="inherit"
                    sx={{ color: 'var(--info-text)' }}
                    onClick={handleCancelOrder}
                  >
                    {`Cancel (${getCommand?.('cancel-order')})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Dialog
        open={addPayment}
        onClose={() => setAddPayment(false)}
      >
        <div className='p-5'>
          <p className="text-gray-500 text-lg mb-5">Payment</p>
          <div className='flex flex-col gap-5'>
            <TextField
              required
              autoFocus
              color="secondary"
              label="Received Amount (Peso)"
              value={payment}
              onChange={(event) => {
                setPayment(Number(event.target.value));
              }}
              variant="outlined"
              size="small"
              InputProps={{
                inputComponent: PesoNumberFormat as any,
              }}
              sx={{
                width: 300,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAddPayment(false);
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              // helperText={errors.cost_price}
              // error={Boolean(errors.cost_price)}
            />
            <TextField
              disabled
              color="secondary"
              label="Change (Peso)"
              value={change}
              variant="outlined"
              size="small"
              InputProps={{
                inputComponent: PesoNumberFormat as any,
              }}
              sx={{
                width: 300,
              }}
              // helperText={errors.cost_price}
              // error={Boolean(errors.cost_price)}
            />
          </div>
        </div>
        <DialogActions>
          <Button
            color="error"
            onClick={() => setAddPayment(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* <Dialog
        open={addCoupon}
        onClose={() => setAddCoupon(false)}
      >
        <div className='p-5'>
          <p className="text-gray-500 text-lg mb-5">Coupon</p>
          <div className='flex flex-col gap-5'>
            <TextField
              required
              autoFocus
              color="secondary"
              label="Coupon Code"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value.toLocaleUpperCase());
              }}
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCoupon();
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              helperText="One coupon per transaction only"
              // error={Boolean(errors.cost_price)}
            />
          </div>
        </div>
        <DialogActions>
          <Button
            color="error"
            onClick={() => setAddCoupon(false)}
          >
            Close
          </Button>
          <Button
            onClick={handleAddCoupon}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog> */}
      <POSMenu
        list={categories}
        anchorEl={posMenuAnchorEl}
        open={Boolean(posMenuAnchorEl)}
        onChange={(ids) => setCategoryIds(ids as Array<string>)}
        onClose={() => setPosMenuAnchorEl(null)}
      />
    </>
  );
}
