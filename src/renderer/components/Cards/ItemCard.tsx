import { Chip, IconButton } from '@mui/material';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { NumericFormat } from 'react-number-format';

interface ItemCardParams {
  cardInfo: ItemDTO;
  onSelect: (id: string) => void;
}

export default function ItemCard({ cardInfo, onSelect }: ItemCardParams) {
  return (
    <div className="w-[325px] h-[460px] py-2">
      <div className="w-full h-full rounded border shadow flex flex-col overflow-hidden">
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
            <div className="absolute top-0 w-full h-full flex justify-center items-center bg-slate-800/50">
              <div>
                <Chip label={cardInfo.status} color="error" size="medium" />
              </div>
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
            <NumericFormat
              style={{ color: 'var(--info-text-color)' }}
              className="mb-2 px-1 bg-white"
              value={cardInfo.selling_price}
              prefix="₱ "
              thousandSeparator
              valueIsNumericString
              disabled
            />
          </div>
          <div className="w-[70px] flex flex-col justify-end items-end">
            <IconButton
              disabled={cardInfo.status !== 'available'}
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
