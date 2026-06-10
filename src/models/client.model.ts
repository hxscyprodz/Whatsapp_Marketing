import { Schema, model } from "mongoose";
import { IClient, ERoles } from "../types/types";

const ClientSchema = new Schema<IClient>({
    clientName: { type: String, required: true, maxlength: 50 },
    phoneNumber: { type: String, required: true, maxlength: 12, unique: true},
    email: { type: String, requied: true, unique: true },
    role: { type: String, default: ERoles.CLIENT},
    password: { type: String, required: true },
    previousPassword: { type: String },
    lastPasswordUpdate: { type: Date, default: new Date() },
    lastLogin: { type: Date },
    isEmailVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Client = model("Client", ClientSchema);
export default Client;