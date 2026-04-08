const config = require('../config/config');

const baseUrl = config.clientUrl || 'http://localhost:3000';

const layout = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#fff; border-radius:8px; overflow:hidden; }
    .header  { background:#1a1a2e; padding:24px 32px; }
    .header h1 { color:#fff; margin:0; font-size:20px; font-weight:600; }
    .body    { padding:32px; color:#333; line-height:1.6; }
    .body h2 { font-size:18px; color:#1a1a2e; margin:0 0 16px; }
    .body p  { margin:0 0 14px; font-size:15px; }
    .btn     { display:inline-block; padding:12px 28px; background:#4f46e5; color:#fff !important;
               text-decoration:none; border-radius:6px; font-size:15px; font-weight:500; margin:8px 0 16px; }
    .info-box { background:#f8f8ff; border-left:3px solid #4f46e5; padding:14px 18px;
                border-radius:0 6px 6px 0; margin:16px 0; font-size:14px; }
    .info-box strong { color:#1a1a2e; }
    .footer  { background:#f5f5f5; padding:20px 32px; text-align:center;
               font-size:12px; color:#888; border-top:1px solid #eee; }
    .tag     { display:inline-block; padding:2px 10px; border-radius:20px;
               font-size:12px; font-weight:500; }
    .tag.green  { background:#e6f9f0; color:#0f6e56; }
    .tag.red    { background:#fef2f2; color:#a32d2d; }
    .tag.blue   { background:#eff6ff; color:#1d4ed8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>${config.appName}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      ${new Date().getFullYear()} ${config.appName} · Bạn nhận email này vì đã đăng ký tài khoản.
    </div>
  </div>
</body>
</html>
`;

// Xác nhận đăng ký tài khoản
const verifyEmail = ({ name, token }) => ({
    subject: 'Xác nhận địa chỉ email của bạn',
    html: layout(`
        <h2>Xin chào ${name}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Nhấn nút bên dưới để xác nhận email:</p>
        <a href="${baseUrl}/verify-email?token=${token}" class="btn">Xác nhận email</a>
        <p style="font-size:13px; color:#888;">Link có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
    `),
});

//Đặt lại mật khẩu
const resetPassword = ({ name, token }) => ({
    subject: 'Đặt lại mật khẩu',
    html: layout(`
        <h2>Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới:</p>
        <a href="${baseUrl}/reset-password/${token}" class="btn">Đặt lại mật khẩu</a>
        <p style="font-size:13px; color:#888;">Link có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `),
});

// Lời mời tham gia khóa học invite_only
const courseInvite = ({ courseName, token, expiresAt }) => ({
    subject: `Bạn được mời tham gia khóa học "${courseName}"`,
    html: layout(`
        <h2>Lời mời tham gia khóa học</h2>
        <p>Xin chào <strong>bạn</strong>,</p>
        <p><strong>Chúng tôi</strong> mời bạn tham gia khóa học:</p>
        <div class="info-box">
            <strong>${courseName}</strong>
        </div>
        <p>Nhấn nút bên dưới để xem chi tiết và xác nhận tham gia:</p>
        <a href="${baseUrl}/invite?token=${token}" class="btn">Xem & Xác nhận</a>
        <p style="font-size:13px; color:#888;">
            Lời mời có hiệu lực đến <strong>${new Date(expiresAt).toLocaleDateString('vi-VN')}</strong>.
        </p>
    `),
});

//Xác nhận đã enroll thành công
const enrollmentConfirmed = ({ name, courseName, cohortName, startDate, formatType }) => {
    const formatLabel = {
        oncampus: 'Học tại chỗ',
        online: 'Học online',
        remote: 'Học từ xa (Zoom)',
        hybrid: 'Kết hợp',
    }[formatType] || formatType;

    return {
        subject: `Đăng ký thành công — ${courseName}`,
        html: layout(`
            <h2>Đăng ký thành công!</h2>
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Bạn đã đăng ký thành công vào khóa học:</p>
            <div class="info-box">
                <strong>${courseName}</strong><br/>
                Lớp: ${cohortName}<br/>
                Hình thức: ${formatLabel}<br/>
                Khai giảng: <strong>${new Date(startDate).toLocaleDateString('vi-VN')}</strong>
            </div>
            <p>Chúng tôi sẽ liên hệ với bạn trước ngày khai giảng với thông tin chi tiết.</p>
            <a href="${baseUrl}/dashboard/my-courses" class="btn">Xem khóa học của tôi</a>
        `),
    };
};

// Thông báo kết quả duyệt enrollment request
const enrollmentRequestReviewed = ({ name, courseName, cohortName, status, rejectionReason }) => {
    const isApproved = status === 'approved';
    return {
        subject: isApproved
            ? `Yêu cầu của bạn đã được duyệt — ${courseName}`
            : `Yêu cầu của bạn chưa được chấp nhận — ${courseName}`,
        html: layout(`
            <h2>${isApproved ? 'Chúc mừng! Yêu cầu được duyệt' : 'Yêu cầu chưa được chấp nhận'}</h2>
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Yêu cầu tham gia khóa học của bạn đã được xem xét:</p>
            <div class="info-box">
                <strong>${courseName}</strong> — ${cohortName}<br/>
                Kết quả: <span class="tag ${isApproved ? 'green' : 'red'}">
                    ${isApproved ? 'Đã duyệt' : 'Từ chối'}
                </span>
                ${!isApproved && rejectionReason ? `<br/><br/>Lý do: ${rejectionReason}` : ''}
            </div>
            ${isApproved
                ? `<p>Tiếp theo, vui lòng hoàn tất thủ tục học phí để xác nhận chỗ học của bạn.</p>
                   <a href="${baseUrl}/dashboard/my-courses" class="btn">Xem chi tiết</a>`
                : `<p>Bạn có thể tìm hiểu các khóa học khác phù hợp hơn trên nền tảng của chúng tôi.</p>
                   <a href="${baseUrl}/courses" class="btn">Khám phá khóa học</a>`
            }
        `),
    };
};

//Nhắc nhở khai giảng sắp tới
const cohortStartReminder = ({ name, courseName, cohortName, startDate, formatType, details }) => ({
    subject: `Nhắc nhở: ${courseName} khai giảng trong 3 ngày`,
    html: layout(`
        <h2>Khóa học sắp bắt đầu!</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Khóa học của bạn sẽ khai giảng trong <strong>3 ngày nữa</strong>:</p>
        <div class="info-box">
            <strong>${courseName}</strong><br/>
            Lớp: ${cohortName}<br/>
            Ngày khai giảng: <strong>${new Date(startDate).toLocaleDateString('vi-VN')}</strong><br/>
            ${details ? `Thông tin thêm: ${details}` : ''}
        </div>
        <a href="${baseUrl}/dashboard/my-courses" class="btn">Xem thông tin lớp học</a>
    `),
});

module.exports = {
    verifyEmail,
    resetPassword,
    courseInvite,
    enrollmentConfirmed,
    enrollmentRequestReviewed,
    cohortStartReminder,
};