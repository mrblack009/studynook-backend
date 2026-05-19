const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Room = require('../models/Room');

const seedData = async () => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount > 0) {
      console.log('Database already has data. Skipping seeder...');
      return;
    }

    console.log('Seeding default data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Host123!', salt);

    const defaultHost = await User.create({
      name: 'Dr. Evelyn Carter',
      email: 'host@studynook.com',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      password: hashedPassword,
    });

    const defaultRooms = [
      {
        name: 'Silicon Valley Collaboration Lab',
        description: 'Premium tech-focused creative space equipped with high-speed Wi-Fi, wall-to-wall magnetic glassboards, dual 4K wireless monitors, and ergonomic seats. Perfect for tech product reviews, hackathon planning, and team brainstorming sessions.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
        floor: '3rd Floor',
        capacity: 8,
        hourlyRate: 10,
        amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Air Conditioning'],
        owner: defaultHost._id,
        bookingCount: 14,
      },
      {
        name: 'The Quiet Sanctuary Pod',
        description: 'A completely soundproof single/dual study pod in the library focus sanctuary. Designed with acoustic panels, fully dimmable anti-glare task lighting, height-adjustable standing desk, and comfy task chairs. Ideal for high-pressure exam cramming, coding, or virtual interviews.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
        floor: '2nd Floor',
        capacity: 2,
        hourlyRate: 5,
        amenities: ['Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'],
        owner: defaultHost._id,
        bookingCount: 28,
      },
      {
        name: 'Newton Physics Alcove',
        description: 'A spacious and sunny study suite looking over the university gardens. Contains large dynamic tables, premium short-throw projector with wireless airplay, adjustable whiteboard easels, and high-capacity power strips. Excellent for physics and maths groups.',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
        floor: '1st Floor',
        capacity: 6,
        hourlyRate: 8,
        amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets'],
        owner: defaultHost._id,
        bookingCount: 9,
      },
      {
        name: 'Creative Media Lounge',
        description: 'Premium media lounge tailored for creative editing and presentations. Features standard high-fidelity audio monitors, widescreen projector screens, color-calibrated panels, ambient LED backlighting, and premium bean bags for comfortable collaboration.',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
        floor: '4th Floor',
        capacity: 10,
        hourlyRate: 12,
        amenities: ['Projector', 'Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'],
        owner: defaultHost._id,
        bookingCount: 17,
      },
      {
        name: 'The Deep Focus Lounge',
        description: 'A cozy research room nestled in the historical archives library. Filled with dark mahogany tables, high-back leather chairs, classic reading lamps, and power plugs. Restricted to absolute quiet focus and independent study.',
        image: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=600&q=80',
        floor: '5th Floor',
        capacity: 4,
        hourlyRate: 6,
        amenities: ['Wi-Fi', 'Power Outlets', 'Quiet Zone'],
        owner: defaultHost._id,
        bookingCount: 22,
      },
      {
        name: 'Turing Innovation Sandbox',
        description: 'State of the art interactive workspace named after Alan Turing. Loaded with smart whiteboard panels that sync straight to your cloud drive, dynamic rolling tables for rapid layout adjustments, ultra high-speed Wi-Fi, and active temperature controls.',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
        floor: '3rd Floor',
        capacity: 12,
        hourlyRate: 15,
        amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Air Conditioning'],
        owner: defaultHost._id,
        bookingCount: 11,
      },
    ];

    const seededRooms = await Room.insertMany(defaultRooms);
    const roomIds = seededRooms.map(r => r._id);
    defaultHost.rooms = roomIds;
    await defaultHost.save();

    console.log('Database successfully seeded with default host and 6 rooms.');
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

module.exports = seedData;
