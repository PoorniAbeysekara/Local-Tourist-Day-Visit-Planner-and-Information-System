import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
});

export default mongoose.model('Category', categorySchema);
