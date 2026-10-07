import mongoose from 'mongoose';

const { Schema } = mongoose;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const hoursSchema = new Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    open: { type: String, match: HHMM, required: true },
    close: { type: String, match: HHMM, required: true },
  },
  { _id: false }
);

const noticeSchema = new Schema({
  type: { type: String, enum: ['closure', 'safety', 'event'], default: 'safety' },
  message: { type: String, required: true, trim: true },
  validUntil: Date,
});

const photoSchema = new Schema({ url: { type: String, required: true }, caption: String }, { _id: false });

const placeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    categories: {
      type: [String],
      validate: [(v) => v.length > 0, 'At least one category is required'],
    },
    location: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
    },
    distanceKm: { type: Number, min: 0, default: 0 },
    entranceFee: { type: Number, min: 0, default: 0 }, // LKR, 0 = free
    open24h: { type: Boolean, default: false },
    openingHours: [hoursSchema],
    visitDuration: { type: Number, min: 5, default: 60 }, // minutes
    travelTips: { type: String, default: '' },
    facilities: { parking: String, restrooms: String, food: String },
    contact: { phone: String, website: String },
    photos: [photoSchema],
    status: { type: String, enum: ['draft', 'active'], default: 'draft' },
    isTempClosed: { type: Boolean, default: false },
    notices: [noticeSchema],
  },
  { timestamps: true }
);

// Current weekday + HH:mm in Sri Lanka time
function colomboNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, time: `${get('hour')}:${get('minute')}` };
}

placeSchema.methods.isOpenNow = function () {
  if (this.isTempClosed) return false;
  if (this.open24h) return true;
  const { day, time } = colomboNow();
  const today = this.openingHours.find((h) => h.day === day);
  return !!today && time >= today.open && time < today.close;
};

export default mongoose.model('Place', placeSchema);
