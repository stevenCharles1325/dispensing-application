export default function addOneDay (date = new Date()) {
  date.setDate(date.getDate() + 1);

  return date;
}
