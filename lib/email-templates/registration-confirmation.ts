// lib/email-templates/registration-confirmation.ts

interface RegistrationEmailParams {
    name: string;
    role: 'attendee' | 'speaker';
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    socialCardUrl?: string;
    talkTitle?: string;
}

export function getRegistrationEmailHtml(params: RegistrationEmailParams): string {
    const { name, role, eventName, eventDate, eventTime, eventVenue, socialCardUrl, talkTitle } = params;

    const roleBadge = role === 'speaker'
        ? `<span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 24px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">SPEAKER</span>`
        : `<span style="display: inline-block; background-color: transparent; color: #dc2626; font-size: 12px; font-weight: 700; padding: 4px 22px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #dc2626; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">ATTENDEE</span>`;

    const speakerSection = role === 'speaker' && talkTitle ? `
                    <!-- Speaker Talk Section -->
                    <tr>
                        <td style="padding: 10px 30px 20px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; border: 1px solid #333333; border-left: 4px solid #dc2626;" bgcolor="#1a1a1a">
                                <tr>
                                    <td style="padding: 18px 20px; background-color: #1a1a1a; border-radius: 8px;">
                                        <p style="margin: 0 0 6px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your Talk</p>
                                        <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${talkTitle}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : '';

    const cardSection = socialCardUrl ? `
                    <!-- Social Card Section -->
                    <tr>
                        <td style="padding: 10px 30px 20px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 10px;">
                                        <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your Social Card</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; border: 1px solid #333333; overflow: hidden;">
                                            <tr>
                                                <td style="padding: 0; line-height: 0;">
                                                    <img src="${socialCardUrl}" alt="Your Social Card" width="300" style="width: 100%; max-width: 300px; height: auto; display: block; border-radius: 8px; border: 0;" />
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : '';

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Registration Confirmation - ${eventName}</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        td { font-family: Arial, sans-serif; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;" bgcolor="#0a0a0a">

    <!-- Outer Wrapper Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a; padding: 0; margin: 0;" bgcolor="#0a0a0a">
        <tr>
            <td align="center" style="padding: 40px 20px;">

                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #222222; max-width: 600px;" bgcolor="#111111">

                    <!-- ============================================ -->
                    <!-- HEADER SECTION -->
                    <!-- ============================================ -->
                    <tr>
                        <td align="center" style="padding: 36px 30px 28px 30px; background: linear-gradient(135deg, #1a0505 0%, #111111 100%); background-color: #1a0505;" bgcolor="#1a0505">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <!-- BLK@ EVENTS branding -->
                                <tr>
                                    <td align="center" style="padding-bottom: 22px;">
                                        <p style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BLK@ EVENTS</p>
                                    </td>
                                </tr>
                                <!-- Event Title Treatment -->
                                <tr>
                                    <td align="center" style="padding-bottom: 6px;">
                                        <p style="margin: 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">THROUGH</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 2px;">
                                        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc2626; font-family: Georgia, 'Times New Roman', serif;">Her</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 22px;">
                                        <p style="margin: 0; font-size: 24px; font-style: italic; color: #cccccc; font-family: Georgia, 'Times New Roman', serif;">Lens</p>
                                    </td>
                                </tr>
                                <!-- Red Divider Line -->
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0" width="80">
                                            <tr>
                                                <td style="height: 2px; background-color: #dc2626; font-size: 0; line-height: 0;" bgcolor="#dc2626">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ============================================ -->
                    <!-- GREETING SECTION -->
                    <!-- ============================================ -->
                    <tr>
                        <td style="padding: 32px 30px 8px 30px;">
                            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">You're registered!</h1>
                            <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hi ${name},</p>
                        </td>
                    </tr>

                    <!-- ============================================ -->
                    <!-- ROLE BADGE -->
                    <!-- ============================================ -->
                    <tr>
                        <td align="center" style="padding: 16px 30px 10px 30px;">
                            ${roleBadge}
                        </td>
                    </tr>

                    <!-- ============================================ -->
                    <!-- EVENT DETAILS - 3 Column Layout -->
                    <!-- ============================================ -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #333333;" bgcolor="#1a1a1a">
                                <tr>
                                    <!-- Date Column -->
                                    <td width="33%" valign="top" style="padding: 0;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 16px 12px 16px 0; width: 3px; background-color: #dc2626;" bgcolor="#dc2626" width="3"></td>
                                                <td style="padding: 16px 10px 16px 12px;" valign="top">
                                                    <p style="margin: 0 0 2px 0; font-size: 18px; line-height: 1;">&#x1F4C5;</p>
                                                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Date</p>
                                                    <p style="margin: 0; font-size: 15px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${eventDate}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Time Column -->
                                    <td width="33%" valign="top" style="padding: 0;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 16px 12px 16px 0; width: 3px; background-color: #dc2626;" bgcolor="#dc2626" width="3"></td>
                                                <td style="padding: 16px 10px 16px 12px;" valign="top">
                                                    <p style="margin: 0 0 2px 0; font-size: 18px; line-height: 1;">&#x23F0;</p>
                                                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Time</p>
                                                    <p style="margin: 0; font-size: 15px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${eventTime}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Venue Column -->
                                    <td width="34%" valign="top" style="padding: 0;">
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 16px 12px 16px 0; width: 3px; background-color: #dc2626;" bgcolor="#dc2626" width="3"></td>
                                                <td style="padding: 16px 10px 16px 12px;" valign="top">
                                                    <p style="margin: 0 0 2px 0; font-size: 18px; line-height: 1;">&#x1F4CD;</p>
                                                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Venue</p>
                                                    <p style="margin: 0; font-size: 15px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${eventVenue}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    ${speakerSection}

                    ${cardSection}

                    <!-- ============================================ -->
                    <!-- CTA BUTTON -->
                    <!-- ============================================ -->
                    <tr>
                        <td style="padding: 10px 30px 28px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://blkat.io/events/through-her-lens" style="height:48px;v-text-anchor:middle;width:100%;" arcsize="13%" fillcolor="#dc2626" strokecolor="#dc2626" strokeweight="0">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">View Event Details</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="https://blkat.io/events/through-her-lens" target="_blank" style="display: block; width: 100%; background-color: #dc2626; color: #ffffff; font-size: 16px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 0; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; mso-padding-alt: 0; mso-text-raise: 0;">View Event Details</a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ============================================ -->
                    <!-- FOOTER -->
                    <!-- ============================================ -->
                    <tr>
                        <td style="padding: 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #222222;">
                                <!-- Social Media Row -->
                                <tr>
                                    <td align="center" style="padding: 20px 30px 10px 30px;">
                                        <p style="margin: 0; font-size: 12px; color: #888888; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Follow us on social media</p>
                                    </td>
                                </tr>
                                <!-- Powered By -->
                                <tr>
                                    <td align="center" style="padding: 6px 30px 6px 30px;">
                                        <p style="margin: 0; font-size: 11px; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Powered by BLK@</p>
                                    </td>
                                </tr>
                                <!-- Copyright -->
                                <tr>
                                    <td align="center" style="padding: 4px 30px 24px 30px;">
                                        <p style="margin: 0; font-size: 11px; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">&copy; ${new Date().getFullYear()} BLK@ Events. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>
    <!-- End Outer Wrapper -->

</body>
</html>
    `.trim();
}
