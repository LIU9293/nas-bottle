import { testnet, mainnet } from './constants';
const NebPay = require('nebPay/nebpay.js');

const neb = new NebPay();

export const simulateFunction = (network = 'mainnet', name, args) => {
  return new Promise((resolve, reject) => {
    neb.simulateCall(network === 'mainnet' ? mainnet.contract : testnet.contract, '0', name, JSON.stringify(args), {
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

export const callFunction = (network = 'mainnet', name, args) => {
  return new Promise((resolve, reject) => {
    neb.call(network === 'mainnet' ? mainnet.contract : testnet.contract, '0', name, JSON.stringify(args), {
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

export const getBottleCount = network => simulateFunction(network, 'getBottleCount')

export const throwBottle = (network, message) => callFunction(network, 'throwBottle', [message])

export const getBottle = network => simulateFunction(network, 'getBottle')

export const getMyBottle = (network, address) => simulateFunction(network, 'getMyBottle', [address])

export const pickBottle = (network, hash) => callFunction(network, 'delBottle', [hash])
