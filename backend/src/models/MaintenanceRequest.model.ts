import mongoose, { Document, Schema } from 'mongoose';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high';

export interface IMaintenanceRequest extends Document {
  room: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images: string[];
  resolvedAt?: Date;
  resolvedNote?: string;
  createdAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'cancelled'], default: 'pending' },
    images: [{ type: String }],
    resolvedAt: { type: Date },
    resolvedNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
