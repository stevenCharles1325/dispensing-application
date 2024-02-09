const getPercentageDifference = (resultToday = 0, resultYesterday = 0) => {
  if (!resultToday || !resultYesterday) return 0;

  return ((resultToday - resultYesterday) / ((resultToday + resultYesterday) / 2)) * 100;
};

export default getPercentageDifference;
