import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'other';

export interface IPayment extends Document {
  invoice: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  note?: string;
  paidAt: Date;
  collectedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank_transfer', 'momo', 'other'], default: 'cash' },
    note: { type: String },
    paidAt: { type: Date, default: Date.now },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
