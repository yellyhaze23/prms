<?php
require_once 'email_config.php';

// Check if composer autoload exists, otherwise use fallback
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    // Fallback: Try to load PHPMailer manually if composer not available
    // This is a fallback for environments where composer install hasn't run yet
    error_log("PHPMailer not found. Please run 'composer install' in prms-backend directory.");
}

// Load PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendVerificationCodeEmail($toEmail, $toName, $code) {
    $config = require 'email_config.php';
    
    try {
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_username'];
        $mail->Password = $config['smtp_password'];
        $mail->SMTPSecure = $config['smtp_encryption']; // 'tls' or 'ssl'
        $mail->Port = $config['smtp_port'];
        
        // Enable verbose debug output (for troubleshooting)
        $mail->SMTPDebug = 2; // Enable verbose debug output
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer Debug ($level): $str");
        };
        
        // Recipients
        $mail->setFrom($config['from_email'], $config['from_name']);
        $mail->addAddress($toEmail, $toName);
        $mail->addReplyTo($config['from_email'], $config['from_name']);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = "Password Reset Verification Code - PRMS";
        
        $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .code-box { background: white; border: 3px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Password Reset Verification</h2>
                </div>
                <div class='content'>
                    <p>Hello {$toName},</p>
                    <p>You have reached the maximum login attempts. Use this verification code to reset your password:</p>
                    <div class='code-box'>{$code}</div>
                    <div class='warning'>
                        <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
                    </div>
                    <p>If you didn't request this, please contact your system administrator immediately.</p>
                    <p>Best regards,<br>PRMS System</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Plain text version (optional but recommended)
        $mail->AltBody = "Password Reset Verification Code\n\nHello {$toName},\n\nYou have reached the maximum login attempts. Use this verification code to reset your password:\n\n{$code}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.\n\nIf you didn't request this, please contact your system administrator immediately.\n\nBest regards,\nPRMS System";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        error_log("Failed to send email to: {$toEmail}. Error: " . $e->getMessage());
        return false;
    }
}
?>

