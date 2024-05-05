import { Badge, Chip, IconButton, Tooltip } from '@mui/material';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import { NumericFormat } from 'react-number-format';

import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import getUOFSymbol from 'UI/helpers/getUOFSymbol';
import { Add } from '@mui/icons-material';
import capitalizeCase from 'UI/helpers/capitalCase';

interface ItemCardParams {
  cardInfo: ItemDTO;
  orderNumber: number;
  onSelect: (id: string) => void;
  onPrint: (item: ItemDTO) => void;
}

export default function ItemCard({ cardInfo, orderNumber = 0, onSelect, onPrint }: ItemCardParams) {
  return (
    <div className="w-[340px] h-[200px]">
      <div className="relative w-full h-full rounded-md overflow-hidden flex flex-col overflow-hidden hover:shadow-lg">
        <div className="w-full h-[200px] bg-white relative rounded-md">
          <img
            src={cardInfo.image?.url}
            alt={cardInfo.image?.name}
            loading="lazy"
            style={{
              objectFit: 'cover',
              width: '360px',
              height: '200px',
            }}
          />
          {cardInfo.status !== 'available' ? (
            <div className="w-full h-full absolute top-0 right-0 flex justify-center items-center bg-slate-800/50">
              <div>
                <Chip label={capitalizeCase(cardInfo.status)} color="error" size="medium" />
              </div>
            </div>
          ) : null}
          {orderNumber > 0 ? (
            <div className="absolute top-0 right-0 flex justify-center items-center p-5">
              <Badge
                badgeContent={orderNumber}
                color="success"
              >
                <ShoppingCartOutlinedIcon color="success" />
              </Badge>
            </div>
          ) : null}
          {/* {cardInfo.discount && cardInfo.discount.status === 'active' ? (
            <div className="absolute top-0 left-0 flex justify-center items-center p-3">
              {
                cardInfo.discount.discount_type === 'buy-one-get-one'
                ? (
                  <Chip
                    variant='filled'
                    label='Buy one, get one!'
                    color="warning"
                  />
                )
                : (
                  <Chip
                    variant='filled'
                    label={`Discount ${
                      cardInfo.discount.discount_type === 'fixed-amount-off'
                      ? '₱'
                      : ''
                    }${
                      cardInfo.discount.discount_value
                    }${
                      cardInfo.discount.discount_type === 'percentage-off'
                      ? '%'
                      : ''
                    } OFF`}
                    color="warning"
                  />
                )
              }
            </div>
          ) : null} */}
        </div>
        <div className="grow p-3 flex flex-row rounded-md justify-between border hover:border-fuchsia-500 absolute top-0 left-0 w-full h-full bg-white/30">
          <div className="w-fit h-fit flex flex-wrap gap-3">
            <div className='w-fit h-fit flex flex-col gap-1 mr-5'>
              <p className="text-md font-bold">
                Item ID:
              </p>
              <div className='max-w-[150px]'>
                <Tooltip title={cardInfo.item_code} arrow>
                  <p
                    className="truncate capitalize text-sm font-thin"
                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    {capitalizeCase(cardInfo.item_code)}
                  </p>
                </Tooltip>
              </div>
            </div>
            <div className='w-fit h-fit flex flex-col gap-1 mr-5'>
              <p className="text-md font-bold">
                Quantity:
              </p>
              <div className='max-w-[150px]'>
                <Tooltip
                  title={`${cardInfo.stock_quantity} ${getUOFSymbol(cardInfo.unit_of_measurement)}}`}
                  arrow
                >
                  <p
                    className="truncate text-sm font-thin"
                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    {cardInfo.stock_quantity} {getUOFSymbol(cardInfo.unit_of_measurement) + '.'}
                  </p>
                </Tooltip>
              </div>
            </div>
            <div className='w-fit h-fit flex flex-col gap-1 mr-5'>
              <p className="text-md font-bold">
                Batch ID:
              </p>
              <div className='max-w-[150px]'>
                <Tooltip title={cardInfo.batch_code} arrow>
                  <p
                    className="truncate text-sm font-thin"
                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    {cardInfo.batch_code}
                  </p>
                </Tooltip>
              </div>
            </div>
            <div className='w-fit h-fit flex flex-col gap-1 mr-5'>
              <p className="text-md font-bold">
                Brand:
              </p>
              <div className='max-w-[150px]'>
                <Tooltip title={cardInfo.brand?.name} arrow>
                  <p
                    className="truncate text-sm font-thin"
                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    {cardInfo.brand?.name}
                  </p>
                </Tooltip>
              </div>
            </div>
            {/* <Chip label="Price:" size="small" />
            {
              cardInfo?.discount &&
              cardInfo.discount.discount_type !== 'buy-one-get-one' &&
              cardInfo.discount.status === 'active'
              ? (
                <div className='w-fit flex flex-row gap-2'>
                  <s>
                    <p
                      style={{ color: 'var(--info-text-color)' }}
                      className="mb-2 px-1 bg-white"
                    >
                      {`₱ ${cardInfo.selling_price}`}
                    </p>
                  </s>
                  <p
                    style={{ color: 'var(--info-text-color)' }}
                    className="mb-2 px-1 bg-white"
                  >
                    {`₱ ${cardInfo.discounted_selling_price}`}
                  </p>
                </div>
              )
              : (
                <NumericFormat
                  style={{ color: 'var(--info-text-color)' }}
                  className="mb-2 px-1 bg-white"
                  value={cardInfo.selling_price}
                  prefix="₱ "
                  thousandSeparator
                  valueIsNumericString
                  disabled
                />
              )
            } */}
          </div>
          <div className="w-[70px] flex flex-row justify-end items-end">
            <IconButton
              disabled={cardInfo.status !== 'available' || orderNumber >= cardInfo.stock_quantity}
              onClick={() => onSelect(cardInfo.id)}
            >
              <Add color="secondary" />
            </IconButton>
            <IconButton
              onClick={() => onPrint(cardInfo)}
            >
              <LocalPrintshopOutlinedIcon color="secondary" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
