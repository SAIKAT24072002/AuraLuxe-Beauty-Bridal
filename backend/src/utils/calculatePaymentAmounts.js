export function calculatePaymentAmounts(totalAmount, advancePercentage = 50) {
  const safeTotal = Number(totalAmount || 0);
  const safeAdvancePercentage = Number(advancePercentage || 0);
  const advanceAmount = Number(
    ((safeTotal * safeAdvancePercentage) / 100).toFixed(2)
  );
  const remainingAmount = Number((safeTotal - advanceAmount).toFixed(2));

  return {
    totalAmount: safeTotal,
    advancePercentage: safeAdvancePercentage,
    advanceAmount,
    remainingAmount,
  };
}

