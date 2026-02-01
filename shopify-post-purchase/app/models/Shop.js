import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
    unique: true
  },
  installedAt: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    default: "Thank you for your purchase! You'll receive a special discount code via email for your next order."
  },
  accessToken: {
    type: String,
    required: false
  }
});

export default mongoose.models.Shop ||
  mongoose.model("Shop", shopSchema);