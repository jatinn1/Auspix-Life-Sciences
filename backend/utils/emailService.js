const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEnquiryEmail = async (enquiry) => {
    const mailOptions = {
        from: `"Auspix Life Sciences" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Enquiry from ${enquiry.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #173b2f;">
                <div style="background: #075b3d; padding: 25px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Auspix Life Sciences</h1>
                </div>

                <div style="padding: 30px; background: #f7faf8;">
                    <h2 style="color: #075b3d;">New Customer Enquiry</h2>

                    <p><strong>Name:</strong> ${enquiry.name}</p>
                    <p><strong>Company:</strong> ${enquiry.company || "Not provided"}</p>
                    <p><strong>Email:</strong> ${enquiry.email}</p>
                    <p><strong>Phone:</strong> ${enquiry.phone || "Not provided"}</p>

                    <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 8px;">
                        <strong>Message</strong>
                        <p style="line-height: 1.7;">${enquiry.message}</p>
                    </div>

                    <p style="margin-top: 25px;">
                        Please log in to the Auspix Admin Dashboard to manage this enquiry.
                    </p>
                </div>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
};

module.exports = {
    sendEnquiryEmail
};