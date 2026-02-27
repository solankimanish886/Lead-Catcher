import mongoose, { Schema, Document } from 'mongoose';
import { User, Agency, Widget, Lead, Note } from '@shared/schema';

// Helper to omit MongoDB specific fields and map _id to id
const transformToJSON = (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
};

// User Model
const UserSchema = new Schema({
    _id: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'rep'], default: 'owner' },
    agencyId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { transform: transformToJSON },
    toObject: { transform: transformToJSON }
});

export const UserModel = mongoose.models.User || mongoose.model<User & Document>('User', UserSchema);

// Agency Model
const AgencySchema = new Schema({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { transform: transformToJSON },
    toObject: { transform: transformToJSON }
});

export const AgencyModel = mongoose.models.Agency || mongoose.model<Agency & Document>('Agency', AgencySchema);

// Widget Model
const WidgetSchema = new Schema({
    _id: { type: Number, required: true },
    agencyId: { type: Number, required: true },
    name: { type: String, required: true },
    fields: { type: [Schema.Types.Mixed], default: [] },
    primaryColor: { type: String, default: "#000000" },
    headingText: { type: String },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { transform: transformToJSON },
    toObject: { transform: transformToJSON }
});

export const WidgetModel = mongoose.models.Widget || mongoose.model<Widget & Document>('Widget', WidgetSchema);

// Lead Model
const LeadSchema = new Schema({
    _id: { type: Number, required: true },
    agencyId: { type: Number, required: true },
    widgetId: { type: Number, required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    formResponses: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["new", "contacted", "qualified", "converted", "closed_lost"], default: "new" },
    assignedTo: { type: Number },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { transform: transformToJSON },
    toObject: { transform: transformToJSON }
});

export const LeadModel = mongoose.models.Lead || mongoose.model<Lead & Document>('Lead', LeadSchema);

// Note Model
const NoteSchema = new Schema({
    _id: { type: Number, required: true },
    leadId: { type: Number, required: true },
    authorId: { type: Number, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { transform: transformToJSON },
    toObject: { transform: transformToJSON }
});

export const NoteModel = mongoose.models.Note || mongoose.model<Note & Document>('Note', NoteSchema);

// Helpers to get the next auto-incrementing ID
export const getNextId = async (model: mongoose.Model<any>) => {
    const result = await model.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();
    return result ? (result._id as number) + 1 : 1;
};
