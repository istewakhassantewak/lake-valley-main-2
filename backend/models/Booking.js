const mongoose = require('mongoose');

function generateBookingId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LV-${ts}-${rand}`;
}

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, default: generateBookingId },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    userFirebaseUid: { type: String, default: '', index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    project: { type: String, required: true, trim: true, default: 'Lake Valley Flower City' },
    plotSize: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 2000 },
    estimatorDetails: {
      katha: { type: Number, default: 0 },
      downPaymentPercent: { type: Number, default: 0 },
      months: { type: Number, default: 0 },
      totalPriceUSD: { type: Number, default: 0 },
      downPaymentUSD: { type: Number, default: 0 },
      monthlyInstallmentUSD: { type: Number, default: 0 },
      currencyCode: { type: String, default: 'USD' },
      formattedTotal: { type: String, default: '' },
      formattedDownPayment: { type: String, default: '' },
      formattedMonthly: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'site_visit_scheduled', 'closed', 'cancelled'],
      default: 'new',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'not_applicable'],
      default: 'not_applicable',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ userFirebaseUid: 1, createdAt: -1 });
bookingSchema.index({ email: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
