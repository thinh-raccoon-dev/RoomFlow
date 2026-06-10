import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface IInvoice extends Document {
  room: mongoose.Types.ObjectId;
  contract: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  month: number;
  year: number;
  rentAmount: number;
  electricityCost: number;
  waterCost: number;
  otherFees: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
  utilityReading?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    contract: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    rentAmount: { type: Number, required: true },
    electricityCost: { type: Number, default: 0 },
    waterCost: { type: Number, default: 0 },
    otherFees: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    notes: { type: String },
    utilityReading: { type: Schema.Types.ObjectId, ref: 'UtilityReading' },
  },
  { timestamps: true }
);

InvoiceSchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
