const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

router.post('/', protect, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, specialNote } = req.body;

    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please fill in all required booking fields' });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ message: 'Booking date must be today or a future date' });
    }

    const startVal = parseTime(startTime);
    const endVal = parseTime(endTime);

    if (endVal <= startVal) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (endVal - startVal < 1) {
      return res.status(400).json({ message: 'Minimum booking duration is 1 hour' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const conflictingBookings = await Booking.find({
      room: roomId,
      date: bookingDate,
      status: 'confirmed',
    });

    const hasConflict = conflictingBookings.some((existing) => {
      const existingStart = parseTime(existing.startTime);
      const existingEnd = parseTime(existing.endTime);
      return startVal < existingEnd && endVal > existingStart;
    });

    if (hasConflict) {
      return res.status(409).json({
        message: 'This room is already booked during the selected time slot. Please choose another time.',
      });
    }

    const totalCost = (endVal - startVal) * room.hourlyRate;

    const booking = await Booking.create({
      room: roomId,
      user: req.user.id,
      date: bookingDate,
      startTime,
      endTime,
      totalCost,
      specialNote: specialNote || '',
      status: 'confirmed',
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { bookings: booking._id },
    });

    await Room.findByIdAndUpdate(roomId, {
      $inc: { bookingCount: 1 },
    });

    return res.status(201).json({
      message: 'Room booked successfully!',
      booking,
    });
  } catch (error) {
    console.error('Create Booking Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', 'name image hourlyRate floor')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot cancel past bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { bookings: booking._id },
    });

    await Room.findByIdAndUpdate(booking.room, {
      $inc: { bookingCount: -1 },
    });

    return res.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
