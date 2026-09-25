const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["NEW", "CONTACTED", "COMPLETED"],
            default: "NEW"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Enquiry", enquirySchema);