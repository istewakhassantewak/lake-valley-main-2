const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const notify = require('../utils/notify');
const fallbackStore = require('../utils/fallbackStore');
const { sanitizeString, isValidEmail, isValidPhone } = require('../utils/validate');
const { success, error } = require('../utils/apiResponse');

exports.createBooking = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const phone = sanitizeString(req.body.phone, 20);
    const email = sanitizeString(req.body.email, 100).toLowerCase();
    const project = sanitizeString(req.body.project || 'Lake Valley Flower City', 100);
    const plotSize = sanitizeString(req.body.plotSize || '', 50);
    const message = sanitizeString(req.body.message || '', 2000);

    if (!name || !phone || !email) {
      return error(res, 'Name, phone number, and email address are required', 400);
    }
    if (!isValidEmail(email)) {
      return error(res, 'Invalid email address', 400);
    }
    if (!isValidPhone(phone)) {
      return error(res, 'Invalid phone number', 400);
    }

    // Process International Investment Estimator details if present
    let estimatorDetails = null;
    let est = req.body.estimatorDetails;
    if (typeof est === 'string') {
      try {
        est = JSON.parse(est);
      } catch {
        est = null;
      }
    }
    if (!est || typeof est !== 'object') {
      est = req.body;
    }

    const hasEstimatorKeys =
      est &&
      (est.katha !== undefined ||
        est.totalPriceUSD !== undefined ||
        est.formattedTotal ||
        est.monthlyInstallmentUSD !== undefined ||
        est.downPaymentPercent !== undefined ||
        est.months !== undefined);

    if (hasEstimatorKeys && (est.katha || est.totalPriceUSD || est.formattedTotal || est.monthlyInstallmentUSD || est.downPaymentPercent || est.months)) {
      estimatorDetails = {
        katha: Number(est.katha) || 0,
        downPaymentPercent: Number(est.downPaymentPercent) || 0,
        months: Number(est.months) || 0,
        totalPriceUSD: Number(est.totalPriceUSD) || 0,
        downPaymentUSD: Number(est.downPaymentUSD) || 0,
        monthlyInstallmentUSD: Number(est.monthlyInstallmentUSD) || 0,
        currencyCode: sanitizeString(est.currencyCode || 'USD', 10),
        formattedTotal: sanitizeString(est.formattedTotal || '', 50),
        formattedDownPayment: sanitizeString(est.formattedDownPayment || '', 50),
        formattedMonthly: sanitizeString(est.formattedMonthly || '', 50),
      };
    }

    const bookingData = {
      name,
      phone,
      email,
      project: project || 'Lake Valley Flower City',
      plotSize,
      message,
      estimatorDetails,
    };

    // Attach current user's Firebase UID and MongoDB User ID if available
    const userFirebaseUid =
      req.firebaseUser?.uid ||
      req.user?.firebaseUid ||
      (typeof req.user?._id === 'string' ? req.user._id : '');

    if (userFirebaseUid) {
      bookingData.userFirebaseUid = userFirebaseUid;
    }

    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      bookingData.userId = req.user._id;
    }

    let booking;
    if (mongoose.connection.readyState === 1) {
      try {
        booking = await Booking.create(bookingData);
      } catch (dbError) {
        booking = fallbackStore.addBooking(bookingData);
        console.warn('MongoDB save failed, used fallback storage:', dbError.message);
      }
    } else {
      booking = fallbackStore.addBooking(bookingData);
    }

    notify(
      `New booking request: ${project}`,
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nProject: ${project}\nPlot size: ${plotSize || '—'}\nMessage: ${message || '—'}${estimatorDetails
        ? `\n\n--- International Investment Estimator Breakdown ---\nKatha: ${estimatorDetails.katha}\nDown Payment: ${estimatorDetails.downPaymentPercent}%\nTenure: ${estimatorDetails.months} Months\nTotal Price: ${estimatorDetails.formattedTotal || estimatorDetails.totalPriceUSD}\nDown Payment: ${estimatorDetails.formattedDownPayment || estimatorDetails.downPaymentUSD}\nMonthly: ${estimatorDetails.formattedMonthly || estimatorDetails.monthlyInstallmentUSD}`
        : ''
      }`
    );

    return success(res, { message: 'Booking request received successfully', booking }, 201);
  } catch (err) {
    console.error('Create booking error:', err);
    return error(res, 'Failed to save booking', 500, err.message);
  }
};

exports.getBookings = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return success(res, { bookings });
    } catch {
      // fallback
    }
  }
  return success(res, { bookings: fallbackStore.getBookings() });
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'contacted', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return error(res, `Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
    }

    const mongoose = require('mongoose');
    let booking = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        booking = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('MongoDB updateBookingStatus failed, trying fallback:', dbErr.message);
      }
    }

    if (!booking) {
      booking = fallbackStore.updateBooking(id, { status });
    }

    if (!booking) {
      return error(res, 'Booking not found', 404);
    }

    return success(res, { message: 'Booking status updated', booking });
  } catch (err) {
    return error(res, 'Failed to update booking status', 500, err.message);
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let deleted = false;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const resMongo = await Booking.findByIdAndDelete(id);
        if (resMongo) deleted = true;
      } catch (dbErr) {
        console.warn('MongoDB deleteBooking failed, trying fallback:', dbErr.message);
      }
    }

    const fallbackDeleted = fallbackStore.deleteBooking(id);
    if (fallbackDeleted) deleted = true;

    if (!deleted) {
      return error(res, 'Booking not found or already deleted', 404);
    }

    return success(res, { message: 'Booking deleted successfully' });
  } catch (err) {
    return error(res, 'Failed to delete booking', 500, err.message);
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        booking = await Booking.findById(id);
      } catch {
        // query error
      }
    }

    if (!booking) {
      const all = fallbackStore.getBookings();
      booking = all.find((b) => b._id === id || b.bookingId === id || b.id === id);
    }

    if (!booking) {
      return error(res, 'Booking not found', 404);
    }

    // Verify ownership via userId, userFirebaseUid, or email
    const userEmail = (req.user?.email || req.firebaseUser?.email || '').toLowerCase();
    const userUid = req.user?.firebaseUid || req.firebaseUser?.uid || (typeof req.user?._id === 'string' ? req.user._id : '');
    const userMongoId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id.toString() : '';

    const bookingUserId = booking.userId ? booking.userId.toString() : '';
    const matchesUid = userUid && (booking.userFirebaseUid === userUid || bookingUserId === userUid);
    const matchesMongoId = userMongoId && bookingUserId === userMongoId;
    const matchesEmail = userEmail && booking.email && booking.email.toLowerCase() === userEmail;

    if (!matchesUid && !matchesMongoId && !matchesEmail) {
      return error(res, 'Not authorized to cancel this booking', 403);
    }

    if (booking.status === 'cancelled') {
      return error(res, 'Booking is already cancelled', 400);
    }
    if (booking.status === 'closed') {
      return error(res, 'Completed bookings cannot be cancelled', 400);
    }

    if (booking.save && typeof booking.save === 'function') {
      booking.status = 'cancelled';
      await booking.save();
    } else {
      booking.status = 'cancelled';
      // update fallbackStore if needed
      const allBookings = fallbackStore.getBookings();
      const item = allBookings.find((b) => b._id === id || b.bookingId === id);
      if (item) {
        item.status = 'cancelled';
        item.updatedAt = new Date().toISOString();
      }
    }

    return success(res, { message: 'Booking cancelled', booking });
  } catch (err) {
    return error(res, 'Failed to cancel booking', 500, err.message);
  }
};
