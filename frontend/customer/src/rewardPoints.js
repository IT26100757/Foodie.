export function rewardPoints(amount) {
  if (amount <= 0) return 0
  if (amount >= 5000) return 5
  if (amount >= 2500) return 3
  if (amount >= 1000) return 2
  return 1
}