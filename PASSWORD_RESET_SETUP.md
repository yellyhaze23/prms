# Password Reset Feature Setup Guide

## Overview
This feature automatically triggers a password reset modal after 5 failed login attempts for admin users. A 6-digit verification code is sent to the admin's email, which they must enter to reset their password.

---

## Step 1: Database Setup

Run the SQL migration file to create the required tables:

```bash
# Option 1: Using MySQL command line
mysql -u your_username -p your_database < prms-backend/database_migrations/password_reset_tables.sql

# Option 2: Using phpMyAdmin or MySQL Workbench
# Open the file: prms-backend/database_migrations/password_reset_tables.sql
# Copy and paste the SQL into your SQL editor and execute
```

**Tables Created:**
- `login_attempts` - Tracks failed login attempts per username/IP (admin only)
- `password_reset_codes` - Stores verification codes for password reset

---

## Step 2: Install PHPMailer

### For Local Development (Laragon)

1. **Install Composer** (if not already installed):
   ```bash
   # Download from: https://getcomposer.org/download/
   # Or use Laragon's built-in Composer
   ```

2. **Install PHPMailer**:
   ```bash
   cd prms-backend
   composer install
   ```

3. **Verify Installation**:
   ```bash
   # Check if vendor folder exists
   ls vendor/phpmailer/phpmailer
   ```

### For Production (Docker/VPS)

PHPMailer is automatically installed during Docker build. Just rebuild:
```bash
docker compose build backend
```

## Step 3: Email Configuration

### For Local Development (Laragon)

Configure SMTP settings in `.env` file (see below).

### For Production (VPS)

**Option A: Using Gmail SMTP (Recommended for testing)**

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. Update environment variables in `.env` file (root directory):

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_ENCRYPTION=tls
FROM_EMAIL=your-email@gmail.com
FROM_NAME=PRMS System
```

**Option B: Using Other SMTP Services**

For production, consider using:
- SendGrid
- Mailgun
- Amazon SES
- Your hosting provider's SMTP

Update the `.env` file with your SMTP credentials.

**Note:** PHPMailer is already installed and configured. Just set up your SMTP credentials.

---

## Step 4: Verify Admin Email

Make sure your admin user has a valid email address in the database:

```sql
-- Check admin email
SELECT id, username, email, role FROM users WHERE role = 'admin';

-- Update admin email if needed
UPDATE users SET email = 'admin@example.com' WHERE role = 'admin' AND username = 'Admin';
```

---

## Step 5: Testing the Feature

### Test Flow:

1. **Test Failed Attempts:**
   - Go to login page
   - Enter admin username
   - Enter wrong password 5 times
   - After 5th attempt, the password reset modal should automatically appear

2. **Test Email Sending:**
   - Modal should show "Sending verification code..."
   - Check admin's email for the 6-digit code
   - Code expires in 10 minutes

3. **Test Code Entry:**
   - Enter the 6-digit code in the modal
   - Click "Verify Code"
   - Should proceed to password reset form

4. **Test Password Reset:**
   - Enter new password (min. 8 characters)
   - Confirm password
   - Click "Reset Password"
   - Should show success message
   - Try logging in with new password

---

## Step 6: Security Features

### Implemented Security Measures:

1. **Login Attempt Tracking:**
   - Only tracks admin users
   - Tracks by username + IP address
   - Locks account for 30 minutes after 5 failed attempts

2. **Verification Code:**
   - 6-digit random code
   - Expires in 10 minutes
   - Max 5 verification attempts per code
   - Codes are marked as used after successful reset

3. **Password Requirements:**
   - Minimum 8 characters
   - Validated on both frontend and backend

4. **Account Unlock:**
   - Login attempts are cleared on successful login
   - Login attempts are cleared after successful password reset

---

## Troubleshooting

### Email Not Sending

**Local Development:**
- Verify PHPMailer is installed: `composer install` in `prms-backend`
- Check SMTP credentials in `.env`
- Check PHP error logs
- Enable debug mode in `send_email.php` (uncomment SMTPDebug lines)

**Production:**
- Verify PHPMailer is installed (check `vendor/` folder exists)
- Verify SMTP credentials in `.env`
- Check firewall allows SMTP port (587 for TLS, 465 for SSL)
- Check server logs: `docker compose logs backend | grep -i mail`
- Verify email address exists in database
- For Gmail: Use App Password, not regular password

### Modal Not Appearing

1. Check browser console for errors
2. Verify `AdminPasswordResetModal.jsx` is imported correctly
3. Check that `showResetModal` state is being set
4. Verify backend returns `requireReset: true` after 5 attempts

### Code Not Working

1. Check code hasn't expired (10 minutes)
2. Verify code matches exactly (case-sensitive)
3. Check database for code status: `SELECT * FROM password_reset_codes WHERE user_id = ?`
4. Verify code hasn't been used already

### Database Errors

1. Verify tables exist: `SHOW TABLES LIKE '%attempt%'` and `SHOW TABLES LIKE '%reset%'`
2. Check foreign key constraint: `users` table must exist
3. Verify database user has INSERT/UPDATE/DELETE permissions

---

## File Structure

```
prms-backend/
├── database_migrations/
│   └── password_reset_tables.sql    # Database migration
├── email_config.php                  # Email configuration
├── send_email.php                    # Email sending function
├── send_reset_code.php               # API: Send verification code
├── verify_code_reset.php             # API: Verify code & reset password
└── authenticate.php                  # Updated with attempt tracking

prms-frontend/src/
├── components/
│   └── AdminPasswordResetModal.jsx   # Password reset modal (Tailwind)
└── admin/
    └── Login.jsx                     # Updated with modal integration
```

---

## Environment Variables Reference

Add these to your `.env` file (root directory):

```env
# Email Configuration (Optional - defaults provided)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_ENCRYPTION=tls
FROM_EMAIL=noreply@prms.local
FROM_NAME=PRMS System
```

---

## Next Steps

1. ✅ Run database migration
2. ✅ Configure email settings
3. ✅ Verify admin email in database
4. ✅ Test the feature
5. ✅ Deploy to production

---

## Support

If you encounter issues:
1. Check server logs: `docker compose logs backend`
2. Check browser console for frontend errors
3. Verify database tables exist and have correct structure
4. Test email sending independently

---

**Note:** This feature is **admin-only**. Staff users are not affected by login attempt tracking.

