// POST /api/save-scorecard
import Scorecard from "../models/scorecard.model.js";
import nodemailer from "nodemailer";
export const savescorecard= async (req, res) => {
  try {
    console.log("recieved",req.body);
    const {
      candidateId,
      resume,
      answers,
      averageScore,
      skillScores,
      evaluatedAnswers,
      jobId
    } = req.body;

    const scorecard = new Scorecard({
      candidateId,
      resume,
      answers,
      averageScore,
      skillScores,
      evaluatedAnswers,
      jobId,
      submittedAt: new Date()
    });

    await scorecard.save();
    res.status(200).json({ success: true, message: "Scorecard saved successfully." });
  } catch (err) {
    console.error("Error saving scorecard:", err);
    res.status(500).json({ success: false, message: "Failed to save scorecard." });
  }
}



export const getscorecard = async (req, res) => {
    try {
        const scorecards = await Scorecard.find();
        res.status(200).json(scorecards);
    } catch (err) {
        console.error("Error fetching scorecards:", err);
        res.status(500).json({ success: false, message: "Failed to fetch scorecards." });
    }
}

export const updatescorecard= async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find the scorecard by ID and update fields passed in request body
    const updatedScorecard = await Scorecard.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedScorecard) {
      return res.status(404).json({ message: 'Scorecard not found' });
    }

    res.json({
      message: 'Scorecard updated successfully',
      scorecard: updatedScorecard,
    });
  } catch (err) {
    console.error('Error updating scorecard:', err);
    res.status(500).json({ message: 'Server error while updating scorecard' });
  }
}

const sendAnotherRoundEmail = async (toEmail, managerName,) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Request for another round of interview',
    html: `
      <p>Hello,</p>
      <p>You have been requested for another round of interview by manager <strong>${managerName}</strong> </strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions)
  await transporter.sendMail(mailOptions);
};

export const emailforanotherround = async (req, res) => {
  const { toEmail, managerName} = req.body;

  try {
    await sendAnotherRoundEmail(toEmail, managerName);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
};
