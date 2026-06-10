import mongoose from 'mongoose';

// Global serialization: every document/lean result returns `id` (string) instead
// of `_id`, drops the Mongoose version key and never leaks `password`.
// Registered before any model is compiled (imported first in app.ts).
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id != null) ret.id = String(ret._id);
      delete ret._id;
      delete ret.password;
      return ret;
    },
  });
});
