import { Badge, Chip, IconButton } from '@mui/material';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import { NumericFormat } from 'react-number-format';

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

interface ItemCardParams {
  cardInfo: ItemDTO;
  orderNumber: number;
  onSelect: (id: string) => void;
}

export default function ItemCard({ cardInfo, orderNumber = 0, onSelect }: ItemCardParams) {
  return (
    <div className="w-[325px] h-[460px] py-2">
      <div className="w-full h-full rounded-md border shadow flex flex-col overflow-hidden hover:border-fuchsia-500 hover:shadow-lg">
        <div className="w-full h-[255px] bg-gray-300 relative">
          <img
            src={cardInfo.image?.url}
            alt={cardInfo.image?.name}
            loading="lazy"
            style={{
              objectFit: 'cover',
              width: '325px',
              height: '255px',
            }}
          />
          {cardInfo.status !== 'available' ? (
            <div className="w-full h-full absolute top-0 right-0 flex justify-center items-center bg-slate-800/50">
              <div>
                <Chip label={cardInfo.status} color="error" size="medium" />
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
          {cardInfo.discount ? (
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
          ) : null}
        </div>
        <div className="grow p-3 flex flex-row justify-between">
          <div className="grow">
            <Chip label="Product Name:" size="small" />
            <p
              className="truncate mb-2 capitalize px-1"
              style={{ color: 'var(--info-text-color)' }}
            >
              {cardInfo.name}
            </p>
            <Chip label="Quantity:" size="small" />
            <p
              className="truncate mb-2 px-1"
              style={{ color: 'var(--info-text-color)' }}
            >
              {cardInfo.stock_quantity}
            </p>
            <Chip label="Price:" size="small" />
            {
              cardInfo?.discount && cardInfo.discount.discount_type !== 'buy-one-get-one'
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
            }
          </div>
          <div className="w-[70px] flex flex-col justify-end items-end">
            <IconButton
              disabled={cardInfo.status !== 'available' || orderNumber >= cardInfo.stock_quantity}
              onClick={() => onSelect(cardInfo.id)}
            >
              <AddCircleOutlineOutlinedIcon color="secondary" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
