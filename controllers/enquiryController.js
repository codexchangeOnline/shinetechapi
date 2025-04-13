const { sendEnquiryEmail } = require("../enquiryMailService");

const addEnquiry=async(req,res)=>{
    const { name, email,phone, message, selectedService } = req.body;

  if (!name || !email ||!phone || !message || !selectedService) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    await sendEnquiryEmail({ name, email, phone, message, selectedService });
    res.status(200).json({ success: true, message: 'Enquiry sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}
module.exports={addEnquiry}