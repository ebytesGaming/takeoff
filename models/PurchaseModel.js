const { Schema, model } = require('mongoose');

const schema = new Schema({
  _id: { type: String, default: '' },
  amount: { type: String, default: '' },
  user: {
    id: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  details: {
    id: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  hash: { type: String, default: '' },
  purchased: { type: String, default: '' }
});

const PurchaseModel = model('purchases', schema);
module.exports = PurchaseModel;
