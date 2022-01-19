export const format = wei => wei && wei / (10 ** 18)
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const RED = 'danger'
export const GREEN = 'success'
export const formatBalance = balance => format(balance).toFixed(2)