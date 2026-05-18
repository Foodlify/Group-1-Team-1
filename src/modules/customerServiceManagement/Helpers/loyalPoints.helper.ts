export function calculateLoyaltyPoints(totalAmount: number) {
  const points = Math.floor(totalAmount / 10);
  return points;
}
export function convertLoyaltyPointsToMoney(points: number) {
  const money = Math.floor(points / 100);
  return money;
}
