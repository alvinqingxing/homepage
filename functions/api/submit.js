export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    const turnstileResponse = data.get('cf-turnstile-response');

    // Check if the request expects a JSON response (AJAX fetch from src/contact.js)
    const acceptHeader = context.request.headers.get('Accept') || '';
    const isJsonExpected = acceptHeader.includes('application/json');

    // Helper function to return either JSON or an HTML redirect fallback
    const createResponse = (jsonPayload, status, redirectUrl) => {
      if (isJsonExpected) {
        return new Response(JSON.stringify(jsonPayload), {
          status: status,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Standard browser form submissions get redirected back to the homepage
        return Response.redirect(redirectUrl, 303);
      }
    };

    // 1. Validation Checks
    if (!name || !email || !message) {
      return createResponse(
        { error: 'Missing required fields' }, 
        400, 
        `${context.request.url.replace('/api/submit', '')}?status=error&msg=missing_fields`
      );
    }

    // 2. Verify Turnstile Token
    const turnstileSecretKey = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileResponse) {
      return createResponse(
        { error: 'Security verification token is missing.' }, 
        400, 
        `${context.request.url.replace('/api/submit', '')}?status=error&msg=missing_token`
      );
    }

    const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const verifyResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: turnstileSecretKey,
        response: turnstileResponse,
        remoteip: context.request.headers.get('CF-Connecting-IP') || ''
      })
    });

    const verifyResult = await verifyResponse.json();
    if (!verifyResult.success) {
      return createResponse(
        { error: 'Security verification failed. Please try again.' }, 
        403, 
        `${context.request.url.replace('/api/submit', '')}?status=error&msg=verification_failed`
      );
    }

    // 3. Proceed to send email
    const resendApiKey = context.env.RESEND_API_KEY;
    const toEmail = context.env.CONTACT_EMAIL;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Website Contact Form <update@updates.alvinlim.dev>',
        to: [toEmail],
        subject: `New Message from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
      }),
    });

    const baseUrl = context.request.url.replace('/api/submit', '');

    if (response.ok) {
      return createResponse(
        { success: true, message: 'Thank you! Your message has been sent.' }, 
        200, 
        `${baseUrl}?status=success`
      );
    } else {
      const errorText = await response.text();
      return createResponse(
        { error: `Error sending email: ${errorText}` }, 
        500, 
        `${baseUrl}?status=error&msg=email_failed`
      );
    }
  } catch (err) {
    const baseUrl = context.request.url.replace('/api/submit', '');
    return createResponse(
      { error: `Server error: ${err.message}` }, 
      500, 
      `${baseUrl}?status=error&msg=server_error`
    );
  }
}