import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  name: string;
  address: string;
  landlord: mongoose.Types.ObjectId;
  electricityPricePerKwh: number;
  waterPricePerM3: number;
  createdAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    electricityPricePerKwh: { type: Number, required: true, default: 3500 },
    waterPricePerM3: { type: Number, required: true, default: 15000 },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
