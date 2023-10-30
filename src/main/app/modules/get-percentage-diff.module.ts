const getPercentageDifference = (resultToday = 0, resultYesterday = 0) => {
  if (!resultToday || !resultYesterday) return 0;

  return ((resultToday - resultYesterday) / resultYesterday) * 100;
};

export default getPercentageDifference;
