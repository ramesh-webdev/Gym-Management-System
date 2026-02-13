const ContactMessage = require('../models/ContactMessage');
const { parsePagination, sendPaginated } = require('../utils/pagination');

exports.createMessage = async (req, res) => {
    try {
        const { name, phone, message } = req.body;
        const newMessage = await ContactMessage.create({ name, phone, message });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error creating message', error: error.message });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
        const { status, search } = req.query;
        const filter = {};
        if (status && status !== 'all' && ['new', 'read', 'replied'].includes(status)) {
            filter.status = status;
        }
        if (search && typeof search === 'string' && search.trim()) {
            const term = search.trim();
            filter.$or = [
                { name: { $regex: term, $options: 'i' } },
                { phone: { $regex: term, $options: 'i' } },
                { message: { $regex: term, $options: 'i' } },
            ];
        }
        const [messages, total] = await Promise.all([
            ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ContactMessage.countDocuments(filter),
        ]);
        const list = messages.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            phone: m.phone,
            message: m.message,
            status: m.status || 'new',
            createdAt: m.createdAt ? m.createdAt.toISOString() : null,
            updatedAt: m.updatedAt ? m.updatedAt.toISOString() : null,
        }));
        sendPaginated(res, list, total, page, limit);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedMessage = await ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating message status', error: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await ContactMessage.findByIdAndDelete(id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};
