const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    /** Status of the message: new, read, replied */
    status: { type: String, default: 'new', enum: ['new', 'read', 'replied'] },
    /** Optional reply content if replied via system (future proofing) */
    reply: { type: String },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
            if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
            return ret;
        },
    },
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
module.exports = ContactMessage;
