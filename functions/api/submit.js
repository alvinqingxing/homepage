export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    const turnstileResponse = data.get('cf-turnstile-response'); // 1. Extract token

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Verify Turnstile Token
    const turnstileSecretKey = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileResponse) {
      return new Response(JSON.stringify({ error: 'Security verification token is missing.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const verifyResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: turnstileSecretKey,
        response: turnstileResponse,
        remoteip: context.request.headers.get('CF-Connecting-IP') || '' // Optional, but recommended
      })
    });

    const verifyResult = await verifyResponse.json();
    if (!verifyResult.success) {
      return new Response(JSON.stringify({ error: 'Security verification failed. Please try again.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Proceed to send email if verification succeeds
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

    if (response.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Error sending email: ${errorText}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: `Server error: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}