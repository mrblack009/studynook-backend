const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;

    if (!name || !description || !image || !floor || !capacity || !hourlyRate) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const room = await Room.create({
      name,
      description,
      image,
      floor,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      amenities: amenities || [],
      owner: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id },
    });

    return res.status(201).json({ message: 'Room added successfully', room });
  } catch (error) {
    console.error('Create Room Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const latestRooms = await Room.find()
      .sort({ createdAt: -1 })
      .limit(6);
    return res.json(latestRooms);
  } catch (error) {
    console.error('Get Latest Rooms Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, amenities, floor, minPrice, maxPrice } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList }; 
      }
    }

    if (floor) {
      query.floor = floor;
    }

    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    return res.json(rooms);
  } catch (error) {
    console.error('Get All Rooms Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.id || req.params.id)
      .populate('owner', 'name email photoUrl');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json(room);
  } catch (error) {
    console.error('Get Room Details Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this room' });
    }

    room.name = name || room.name;
    room.description = description || room.description;
    room.image = image || room.image;
    room.floor = floor || room.floor;
    room.capacity = capacity !== undefined ? Number(capacity) : room.capacity;
    room.hourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : room.hourlyRate;
    room.amenities = amenities || room.amenities;

    const updatedRoom = await room.save();
    return res.json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    console.error('Update Room Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }

    await Room.deleteOne({ _id: req.params.id });

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { rooms: req.params.id },
    });

    const bookings = await Booking.find({ room: req.params.id });
    const bookingIds = bookings.map(b => b._id);

    await Booking.updateMany({ room: req.params.id }, { status: 'cancelled' });

    await User.updateMany(
      { bookings: { $in: bookingIds } },
      { $pull: { bookings: { $in: bookingIds } } }
    );

    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete Room Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
