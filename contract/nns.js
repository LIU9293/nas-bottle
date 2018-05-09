/* eslint-disable no-undef */
/* eslint-disable object-shorthand */
var Bottle = function() {};

Bottle.prototype = {
  init: function() {
    LocalContractStorage.put('hashs', []);
  },

  throwBottle: function(message) {
    // check name is already registered
    if (message === '' || typeof message !== 'string') {
      throw new Error('message invalid');
    }

    var hash = Blockchain.transaction.hash || Blockchain.transaction.timestamp;
    var hashs = LocalContractStorage.get('hashs');
    var owner = Blockchain.transaction.from;

    LocalContractStorage.put('hashs', hashs.concat([hash]));
    LocalContractStorage.put(hash, { message: message, owner: owner });
    return true;
  },

  getBottle: function() {
    var hashs = LocalContractStorage.get('hashs');
    if (hashs.length === 0) {
      throw new Error('no bottles');
    }

    var randomHash = hashs[Math.floor(Math.random() * hashs.length)];
    var message = LocalContractStorage.get(randomHash);

    return {
      hash: randomHash,
      message: message.message,
      owner: message.owner,
    };
  },

  getMyBottle: function(owner) {
    var ownerBottles = LocalContractStorage.get(owner);
    if (!ownerBottles) {
      return [];
    }
    return ownerBottles;
  },

  delBottle: function(hash) {
    var bottle = LocalContractStorage.get(hash);
    if (!bottle) {
      throw new Error('no bottle with hash: ' + hash);
    }

    var owner = Blockchain.transaction.from;
    var ownerBottles = LocalContractStorage.get(owner);
    if (!ownerBottles) {
      LocalContractStorage.put(owner, [bottle]);
    } else {
      LocalContractStorage.put(owner, ownerBottles.concat(bottle));
    }

    var hashs = LocalContractStorage.get('hashs');
    LocalContractStorage.del(hash);
    var newHashs = hashs.filter(function(item) {
      return item !== hash;
    });
    LocalContractStorage.put('hashs', newHashs);
    return true;
  },

  getBottleCount: function() {
    var length = LocalContractStorage.get('hashs').length;
    return length;
  },
};

module.exports = Bottle;

// contract n1gGNhrSJd4APnU4UZT2m6dAwDTc5VRQtBw
