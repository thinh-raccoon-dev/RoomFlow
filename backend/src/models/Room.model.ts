import mongoose, { Document, Schema } from 'mongoose';

export type RoomStatus = 'vacant' | 'occupied';

export interface IRoom extends Document {
  roomNumber: string;
  property: mongoose.Types.ObjectId;
  floor: number;
  area: number;
  baseRent: number;
  status: RoomStatus;
  description?: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, trim: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    floor: { type: Number, default: 1 },
    area: { type: Number, required: true },
    baseRent: { type: Number, required: true },
    status: { type: String, enum: ['vacant', 'occupied'], default: 'vacant' },
    description: { type: String },
  },
  { timestamps: true }
);

RoomSchema.index({ property: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model<IRoom>('Room', RoomSchema);
