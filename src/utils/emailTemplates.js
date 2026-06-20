const feePaidTemplate = (studentName, semester, amount) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4f46e5;">✅ Fee Payment Confirmed</h2>
    <p>Dear ${studentName},</p>
    <p>Your fee payment of <strong>₹${amount}</strong> for <strong>Semester ${semester}</strong> has been recorded successfully.</p>
    <p>Your admit card has been automatically generated. You can download it from your dashboard.</p>
    <br>
    <p>Regards,<br>College ERP System</p>
  </div>
`;

const attendanceAlertTemplate = (studentName, percentage) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">⚠️ Attendance Alert</h2>
    <p>Dear ${studentName},</p>
    <p>Your attendance has dropped to <strong>${percentage}%</strong>.</p>
    <p>Please note that attendance below <strong>75%</strong> may affect your exam eligibility.</p>
    <p>You need to attend at least <strong>${Math.ceil(75 - percentage)}</strong> more classes to reach the required threshold.</p>
    <br>
    <p>Regards,<br>College ERP System</p>
  </div>
`;

const admitCardTemplate = (studentName, semester) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4f46e5;">🎫 Admit Card Generated</h2>
    <p>Dear ${studentName},</p>
    <p>Your admit card for <strong>Semester ${semester}</strong> has been generated.</p>
    <p>You can download it from your student dashboard.</p>
    <br>
    <p>Regards,<br>College ERP System</p>
  </div>
`;

const walletCreditTemplate = (studentName, amount) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4f46e5;">💰 Wallet Updated</h2>
    <p>Dear ${studentName},</p>
    <p>An amount of <strong>₹${amount}</strong> has been added to your wallet.</p>
    <p>You can view your updated wallet balance on your dashboard.</p>
    <br>
    <p>Regards,<br>College ERP System</p>
  </div>
`;

module.exports = {
  feePaidTemplate,
  attendanceAlertTemplate,
  admitCardTemplate,
  walletCreditTemplate,
};