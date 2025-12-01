const formatAmount = (value) => {
  return Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
export default formatAmount;