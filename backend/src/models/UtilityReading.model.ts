import mongoose, { Document, Schema } from 'mongoose';

export interface IUtilityReading extends Document {
  room: mongoose.Types.ObjectId;
  month: number;
  year: number;
  electricityOld: number;
  electricityNew: number;
  waterOld: number;
  waterNew: number;
  electricityUsed: number;
  waterUsed: number;
  electricityCost: number;
  waterCost: number;
  createdAt: Date;
}

const UtilityReadingSchema = new Schema<IUtilityReading>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    electricityOld: { type: Number, required: true, default: 0 },
    electricityNew: { type: Number, required: true },
    waterOld: { type: Number, required: true, default: 0 },
    waterNew: { type: Number, required: true },
    electricityUsed: { type: Number },
    waterUsed: { type: Number },
    electricityCost: { type: Number },
    waterCost: { type: Number },
  },
  { timestamps: true }
);

UtilityReadingSchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

UtilityReadingSchema.pre('save', async function (next) {
  this.electricityUsed = this.electricityNew - this.electricityOld;
  this.waterUsed = this.waterNew - this.waterOld;

  const room = await mongoose.model('Room').findById(this.room).populate('property');
  if (room) {
    const property = (room as any).property;
    this.electricityCost = this.electricityUsed * (property?.electricityPricePerKwh || 3500);
    this.waterCost = this.waterUsed * (property?.waterPricePerM3 || 15000);
  }
  next();
});

export default mongoose.model<IUtilityReading>('UtilityReading', UtilityReadingSchema);
