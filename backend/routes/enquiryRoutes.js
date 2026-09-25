const { sendEnquiryEmail } = require("../utils/emailService");
const express = require("express");
const Enquiry = require("../models/Enquiry");
const authenticateToken = require("../middleware/authMiddleware");
const { enquiryValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/", enquiryValidation, async (req, res) => {
    try {
        const { name, company, email, phone, message } = req.body;

        const enquiry = new Enquiry({
            name,
            company,
            email,
            phone,
            message,
            status: "NEW"
        });

        await enquiry.save();

        try {
            await sendEnquiryEmail(enquiry);
        } catch (emailError) {
            console.error(
                "Email notification failed:",
                emailError.message
            );
        }

        res.status(201).json({
            message: "Enquiry submitted successfully",
            enquiry
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit enquiry",
            error: error.message
        });
    }
});

router.get("/", authenticateToken, async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });

        res.json(enquiries);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch enquiries",
            error: error.message
        });
    }
});

router.patch("/:id/status", authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "NEW",
            "CONTACTED",
            "COMPLETED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid enquiry status"
            });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({
                message: "Enquiry not found"
            });
        }

        res.json({
            message: "Enquiry status updated successfully",
            enquiry
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update enquiry status",
            error: error.message
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({
                message: "Enquiry not found"
            });
        }

        res.json({
            message: "Enquiry deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete enquiry",
            error: error.message
        });
    }
});

module.exports = router;