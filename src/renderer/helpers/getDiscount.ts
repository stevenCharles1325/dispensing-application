type DiscountTypeType = 'fixed-amount-off' | 'percentage-off' | 'buy-one-get-one';

export default function getDiscount(
  price: number = 0,
  discountType: DiscountTypeType | null = null,
  discountValue: number = 0
) {
  let discount = 0;
  let discountedPrice = price;

  switch (discountType) {
    case 'fixed-amount-off':
      discount = discountValue;
      discountedPrice = price - discount;
      break;

    case 'percentage-off':
      discount = price * (discountValue / 100)
      discountedPrice = price - discount;
      break;

    default:
      break;
  }

  return {
    discount,
    discountedPrice,
    formattedDiscountedPrice: `₱ ${discountedPrice}`,
    formattedDiscount: `₱ ${discount}`,
  };
}
