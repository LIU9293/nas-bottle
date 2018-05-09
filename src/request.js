import { testnet } from './constants';
const NebPay = require('nebPay/nebpay.js');

const neb = new NebPay();

export const simulateFunction = (name, args) => {
  return new Promise((resolve, reject) => {
    neb.simulateCall(testnet.contract, '0', name, JSON.stringify(args), {
        listener: function(res) {
          if (res.execute_err !== '') {
            reject(res.execute_err);
          }
          try {
            const result = JSON.parse(res.result);
            resolve(result);
          } catch (e) {
            resolve(res);
          }
        }
    });
  });
}

export const callFunction = (name, args) => {
  return new Promise((resolve, reject) => {
    neb.call(testnet.contract, '0', name, JSON.stringify(args), {
        listener: function(res) {
          if (typeof res === 'string' && res.indexOf('Error:') >= 0) {
            reject(res);
          }
          // { txHash: '' }
          try {
            resolve(JSON.parse(res));
          } catch (e) {
            resolve(res);
          }
        }
    });
  });
}

export const getBottleCount = () => simulateFunction('getBottleCount')

export const throwBottle = message => callFunction('throwBottle', [message])

export const getBottle = () => simulateFunction('getBottle')

export const getMyBottle = address => simulateFunction('getMyBottle', [address])

export const pickBottle = hash => callFunction('delBottle', [hash])
