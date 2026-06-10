import mongoose, { Document, Schema } from 'mongoose';

export type ContractStatus = 'active' | 'ended' | 'pending';

export interface IContract extends Document {
  room: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  rentPrice: number;
  deposit: number;
  status: ContractStatus;
  notes?: string;
  createdAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentPrice: { type: Number, required: true },
    deposit: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'ended', 'pending'], default: 'active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>('Contract', ContractSchema);
