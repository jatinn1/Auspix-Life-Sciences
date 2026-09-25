const { body, validationResult } = require("express-validator");

const enquiryValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ max: 100 })
        .withMessage("Name must not exceed 100 characters"),

    body("company")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Company name must not exceed 150 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .isLength({ max: 150 })
        .withMessage("Email must not exceed 150 characters"),

    body("phone")
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage("Phone number must not exceed 30 characters"),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Message must be between 10 and 2000 characters"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array()
            });
        }

        next();
    }
];

module.exports = {
    enquiryValidation
};