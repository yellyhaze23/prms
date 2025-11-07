# PHPMailer Setup Guide

## Overview
The password reset feature now uses PHPMailer for reliable email delivery via SMTP.

---

## Installation

### For Local Development (Laragon)

1. **Install Composer** (if not already installed):
   - Download from: https://getcomposer.org/download/
   - Or use Laragon's built-in Composer

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

The Dockerfile automatically installs PHPMailer during build:
```bash
# Rebuild the backend container
docker compose build backend

# Or rebuild all containers
docker compose build
```

---

## Configuration

### 1. Environment Variables

Add to your `.env` file (root directory):

```env
# Email Configuration (Required for PHPMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_ENCRYPTION=tls
FROM_EMAIL=your-email@gmail.com
FROM_NAME=PRMS System
```

### 2. Gmail Setup (Recommended for Testing)

1. **Enable 2-Step Verification**:
   - Go to Google Account → Security → 2-Step Verification
   - Enable it

2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "PRMS" as the name
   - Copy the 16-character password

3. **Update .env**:
   ```env
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password
   ```

### 3. Other SMTP Services

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_ENCRYPTION=tls
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
SMTP_ENCRYPTION=tls
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-aws-access-key
SMTP_PASSWORD=your-aws-secret-key
SMTP_ENCRYPTION=tls
```

---

## Testing

### Test Email Sending

1. **Trigger Password Reset**:
   - Login with wrong password 5 times (admin account)
   - Modal should appear
   - Check email for verification code

2. **Check Logs** (if email fails):
   ```bash
   # Docker
   docker compose logs backend | grep -i mail
   
   # Laragon
   # Check PHP error logs in Laragon
   ```

### Enable Debug Mode (Optional)

To see detailed SMTP debug output, uncomment these lines in `send_email.php`:

```php
// Enable verbose debug output
$mail->SMTPDebug = 2;
$mail->Debugoutput = 'error_log';
```

**Note:** Disable debug mode in production for security.

---

## Troubleshooting

### Error: "PHPMailer not found"

**Solution:**
```bash
cd prms-backend
composer install
```

### Error: "SMTP connect() failed"

**Possible Causes:**
1. Wrong SMTP credentials
2. Firewall blocking port 587/465
3. Gmail "Less secure app access" (use App Password instead)

**Solution:**
- Verify SMTP credentials in `.env`
- Check firewall settings
- Use App Password for Gmail (not regular password)

### Error: "Authentication failed"

**Solution:**
- For Gmail: Use App Password, not regular password
- Verify username and password are correct
- Check if 2-Step Verification is enabled (Gmail)

### Email Goes to Spam

**Solution:**
- Use a proper "From" email address (not noreply@)
- Set up SPF/DKIM records for your domain
- Use a reputable SMTP service (SendGrid, Mailgun, etc.)

---

## File Structure

```
prms-backend/
├── composer.json              # PHP dependencies
├── composer.lock              # Lock file (auto-generated)
├── vendor/                    # Composer packages (auto-generated)
│   └── phpmailer/
│       └── phpmailer/
├── email_config.php           # Email configuration
└── send_email.php             # PHPMailer implementation
```

---

## Benefits of PHPMailer

✅ **Reliable SMTP Support** - Works with Gmail, SendGrid, Mailgun, etc.  
✅ **Better Error Handling** - Detailed error messages  
✅ **Security** - Supports TLS/SSL encryption  
✅ **Production Ready** - Used by millions of websites  
✅ **HTML Emails** - Rich email templates  
✅ **Attachment Support** - Can send files (future feature)  

---

## Next Steps

1. ✅ Install Composer (if not installed)
2. ✅ Run `composer install` in `prms-backend`
3. ✅ Configure SMTP settings in `.env`
4. ✅ Test email sending
5. ✅ Deploy to production

---

## Support

If you encounter issues:
1. Check PHP error logs
2. Enable SMTP debug mode
3. Verify SMTP credentials
4. Test with a simple email service first (Gmail)

