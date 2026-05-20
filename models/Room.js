const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a room name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    floor: {
      type: String,
      required: [true, 'Please specify the floor level'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the seat capacity'],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please specify the hourly rate'],
    },
    amenities: {
      type: [String],
      enum: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
