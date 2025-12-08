/**
 * Email Service Configuration Detection
 * 
 * Checks if email service (SMTP) is configured and available.
 * Returns true if required environment variables are set with non-placeholder values.
 * 
 * In dev mode without .env file, these will be undefined or use placeholder values.
 * Follows the same pattern as isDirectusConfigured() for consistency.
 */

/**
 * Checks if email service is configured and available.
 * Returns true if all required SMTP environment variables are set with non-placeholder values.
 * 
 * Required variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_FROM: Email address to send from
 * - SMTP_TO: Email address to send to
 * 
 * Optional variables (if authentication is required):
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * 
 * @returns {boolean} True if email service is properly configured, false otherwise
 */
export function isEmailServiceConfigured(): boolean {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpFrom = process.env.SMTP_FROM;
  const smtpTo = process.env.SMTP_TO;
  
  // Check if all required variables are set, not empty, and not placeholder values
  const hasHost = smtpHost && 
                  smtpHost.trim() !== "" && 
                  !smtpHost.includes("your-") && // Exclude placeholder text
                  smtpHost !== "localhost" && // Exclude default placeholder
                  smtpHost !== "smtp.example.com"; // Exclude example placeholder
  
  const hasPort = smtpPort && 
                  smtpPort.trim() !== "" && 
                  !isNaN(Number(smtpPort)) && // Must be a valid number
                  Number(smtpPort) > 0; // Must be positive
  
  const hasFrom = smtpFrom && 
                  smtpFrom.trim() !== "" && 
                  smtpFrom.includes("@") && // Must be a valid email format
                  !smtpFrom.includes("your-") && // Exclude placeholder text
                  smtpFrom !== "contact@example.com"; // Exclude example placeholder
  
  const hasTo = smtpTo && 
                smtpTo.trim() !== "" && 
                smtpTo.includes("@") && // Must be a valid email format
                !smtpTo.includes("your-") && // Exclude placeholder text
                smtpTo !== "your-email@example.com"; // Exclude example placeholder
  
  // All required variables must be present and valid
  return !!(hasHost && hasPort && hasFrom && hasTo);
}

