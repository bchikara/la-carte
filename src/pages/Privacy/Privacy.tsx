import React from 'react';
// import Header from '../header/header'; // Uncomment if you have a Header component for this page
import './Privacy.scss';

const Privacy: React.FC = () => {
     return (
         <>
            {/* <Header /> */} {/* Uncomment if a Header is used on this page */}
            <div className="PolicyPage"> {/* Renamed class for clarity and consistency */}
                <div className="policy-content-wrapper section-padding"> {/* Added wrapper and section-padding */}
                    {/* Watermark will be applied via SCSS pseudo-element to policy-content-wrapper */}
                    <div className="la-costa-fixed-watermark-placeholder"></div> {/* This can be removed if watermark is on wrapper */}

                    <header className="policy-header">
                        <h1 className="section-title">Privacy Policy</h1>
                    </header>
                    
                    <article className="policy-article-content">
                        <section>
                            <h2>Overview</h2>
                            <p>This Privacy Policy (“Policy”) describes the policies and procedures on the collection, use, disclosure and
                                protection of your information when you use our website located at <a href="https://thelacarte.com" target="_blank" rel="noopener noreferrer">thelacarte.com</a> (“Lacarte Platform”) made
                                available by Lacarte (“Lacarte ”, “Company”, “we”, “us” and “our”),&nbsp; a proprietorship established under the laws of
                                India having its registered office at <br/><strong>
                                F-53, Samrat Prithviraj Chauhan Marg, <br />
                                Chandarwardai Nagar, Ajmer, <br />
                                Ajmer, Rajasthan, 305001, India
                                </strong>
                                &nbsp;
                            </p>
                            <p>The terms “you” and “your” refer to the user of the Lacarte Platform. The term “Services” refers to any services
                                offered by Lacarte whether on the Lacarte Platform or otherwise.
                                Please read this Policy before using the Lacarte Platform or submitting any personal information to Lacarte. This
                                Policy is a part of and incorporated within, and is to be read along with, the Terms of Use.
                            </p>
                        </section>

                        <section>
                            <h2>YOUR CONSENT</h2>
                            <p>By using the Lacarte Platform and the Services, you agree and consent to the collection, transfer, use, storage,
                                disclosure and sharing of your information as described and collected by us in accordance with this Policy.&nbsp; If you
                                do not agree with the Policy, please do not use or access the Lacarte Platform.</p>
                        </section>

                        <section>
                            <h2>POLICY CHANGES</h2>
                            <p>We may occasionally update this Policy and such changes will be posted on this page. If we make any significant
                                changes to this Policy we will endeavor to provide you with reasonable notice of such changes, such as via prominent
                                notice on the Lacarte Platform or to your email address on record and where required by applicable law, we will
                                obtain your consent. To the extent permitted under the applicable law, your continued use of our Services after we
                                publish or send a notice about our changes to this Policy shall constitute your consent to the updated Policy.
                            </p>
                        </section>

                        <section>
                            <h2>LINKS TO OTHER WEBSITES</h2>
                            <p>
                                The Lacarte Platform may contain links to other websites. Any personal information about you collected whilst
                                visiting such websites is not governed by this Policy. Lacarte shall not be responsible for and has no control over
                                the practices and content of any website accessed using the links contained on the Lacarte Platform. This Policy
                                shall not apply to any information you may disclose to any of our service providers/service personnel which we do
                                not require you to disclose to us or any of our service providers under this Policy.
                            </p>
                        </section>

                        <section>
                            <h2>INFORMATION WE COLLECT FROM YOU</h2>
                            <p>We will collect and process the following information about you:</p>
                            <p><strong>Information you give us</strong> - This includes information submitted when you:</p>
                            <ul>
                                <li>Create or update your Lacarte account, which may include your name, email, phone number, login name and password, address, payment or banking information, date of birth and profile picture. If you sign in to the Lacarte Platform through third-party sign-in services such as Facebook, Google Plus or Gmail or any other social networking or similar site (collectively, “SNS”), an option of which may be provided to you by Lacarte at its sole discretion, you will be allowing us to pass through and receive from the SNS your log-in information and other user data; or</li>
                                <li>Provide content to us, which may include reviews, ordering details and history, favorite vendors, special merchant requests, contact information of people you refer to us and other information you provide on the Lacarte Platform (“Your Content”).</li>
                                <li>Use our Services, we may collect and store information about you to process your requests and automatically complete forms for future transactions, including (but not limited to) your phone number, address, email, billing information and credit or payment card information.</li>
                                <li>Correspond with Lacarte for customer support;</li>
                                <li>Participate in the interactive services offered by the Lacarte Platform such as discussion boards, competitions, promotions or surveys, other social media functions or make payments etc., or</li>
                                <li>Enable features that require Lacarte's access to your address book or calendar;</li>
                                <li>Report problems for troubleshooting.</li>
                            </ul>
                            <p>If you sign up to use our Services as a merchant, we may collect location details, copies of government identification documents and other details (KYC), call and SMS details.</p>
                            <p><strong>Information we collect about you</strong> - With regard to each of your visits to the Lacarte Platform, we will automatically collect and analyze the following demographic and other information:</p>
                            <ul>
                                <li>When you communicate with us (via email, phone, through the Lacarte Platform or otherwise), we may maintain a record of your communication;</li>
                                <li>Location information: Depending on the Services that you use, and your app settings or device permissions, we may collect your real time information, or approximate location information as determined through data such as GPS, IP address;</li>
                                <li>Usage and Preference Information: We collect information as to how you interact with our Services, preferences expressed and settings chosen. Lacarte Platform collects browsing information including without limitation your Internet protocol (IP) address and location, your login information, browser type and version, date and time stamp, user agent, time zone setting, browser plug-in types and versions, operating system and platform, and other information about user activities on the Lacarte Platform.</li>
                                <li>Transaction Information: We collect transaction details related to your use of our Services, and information about your activity on the Services, including the full Uniform Resource Locators (URL), the type of Services you requested or provided, comments, domain names, search results selected, number of clicks, information and pages viewed and searched for, the order of those pages, length of your visit to our Services, the date and time you used the Services, amount charged, details regarding application of promotional code, methods used to browse away from the page and any phone number used to call our customer service number and other related transaction details;</li>
                                <li>Device Information: We may collect information about the devices you use to access our Services, including the hardware models, operating systems and versions, software, file names and versions, preferred languages, unique device identifiers, advertising identifiers, serial numbers, device motion information and mobile network information. Analytics companies may use mobile device IDs to track your usage of the Lacarte Platform;</li>
                                <li>Stored information and files:&nbsp; Lacarte web application (Lacarte app) may also access metadata and other information associated with other files stored on your mobile device. This may include, for example, photographs, audio and video clips, personal contacts and address book information. If you permit the Lacarte app to access the address book on your device, we may collect names and contact information from your address book to facilitate social interactions through our services and for other purposes described in this Policy or at the time of consent or collection. If you permit the Lacarte app to access the calendar on your device, we collect calendar information such as event title and description, your response (Yes, No, Maybe), date and time, location and number of attendees.</li>
                            </ul>
                            <p>If you are a partner restaurant, merchant or a delivery partner, we will, additionally, record your calls with us made from the device used to provide Services, related call details, SMS details location and address details.</p>
                            <p><strong>Information we receive from other sources</strong> -</p>
                            <ul>
                                <li>We may receive information about you from third parties, such as other users, partners (including ad partners, analytics providers, search information providers), or our affiliated companies or if you use any of the other websites/apps we operate or the other Services we provide. Users of our Ad Services and other third-parties may share information with us such as the cookie ID, device ID, or demographic or interest data, and information about content viewed or actions taken on a third-party website, online services or apps. For example, users of our Ad Services may also be able to share customer list information (e.g., email or phone number) with us to create customized audience segments for their ad campaigns.</li>
                                <li>When you sign in to Lacarte Platform with your SNS account, or otherwise connect to your SNS account with the Services, you consent to our collection, storage, and use, in accordance with this Policy, of the information that you make available to us through the social media interface. This could include, without limitation, any information that you have made public through your social media account, information that the social media service shares with us, or information that is disclosed during the sign-in process.&nbsp; Please see your social media provider’s privacy policy and help center for more information about how they share information when you choose to connect your account.</li>
                            </ul>
                            <p>If you are partner restaurant or merchant, we may, additionally, receive feedback and rating from other users.</p>
                        </section>

                        <section>
                            <h2>COOKIES</h2>
                            <p>Our Lacarte Platform and third parties with whom we partner, may use cookies, pixel tags, web beacons, mobile device IDs, “flash cookies” and similar files or technologies to collect and store information with respect to your use of the Services and third-party websites.</p>
                            <p>Cookies are small files that are stored on your browser or device by websites, apps, online media and advertisements. We use cookies and similar technologies for purposes such as:</p>
                            <ul>
                                <li>Authenticating users;</li>
                                <li>Remembering user preferences and settings;</li>
                                <li>Determining the popularity of content;</li>
                                <li>Delivering and measuring the effectiveness of advertising campaigns;</li>
                                <li>Analyzing site traffic and trends, and generally understanding the online behaviors and interests of people who interact with our services.</li>
                            </ul>
                            <p>A pixel tag (also called a web beacon or clear GIF) is a tiny graphic with a unique identifier, embedded invisibly on a webpage (or an online ad or email), and is used to count or track things like activity on a webpage or ad impressions or clicks, as well as to access cookies stored on users’ computers. We use pixel tags to measure the popularity of our various pages, features and services. We also may include web beacons in e-mail messages or newsletters to determine whether the message has been opened and for other analytics.</p>
                            <p>To modify your cookie settings, please visit your browser’s settings. By using our Services with your browser settings to accept cookies, you are consenting to our use of cookies in the manner described in this section.</p>
                            <p>We may also allow third parties to provide audience measurement and analytics services for us, to serve advertisements on our behalf across the Internet, and to track and report on the performance of those advertisements. These entities may use cookies, web beacons, SDKs and other technologies to identify your device when you visit the Lacarte Platform and use our Services, as well as when you visit other online sites and services.</p>
                        </section>

                        <section>
                            <h2>USES OF YOUR INFORMATION</h2>
                            <p>We use the information we collect for following purposes, including:</p>
                            <ul>
                                <li>To provide, personalize, maintain and improve our products and services, such as to enable deliveries and other services, enable features to personalize your Lacarte account;</li>
                                <li>To carry out our obligations arising from any contracts entered into between you and us and to provide you with the relevant information and services;</li>
                                <li>To administer and enhance the security of our Lacarte Platform and for internal operations, including troubleshooting, data analysis, testing, research, statistical and survey purposes;</li>
                                <li>To provide you with information about services we consider similar to those that you are already using, or have enquired about, or may interest you. If you are a registered user, we will contact you by electronic means (e-mail or SMS or telephone) with information about these services;</li>
                                <li>To understand our users (what they do on our Services, what features they like, how they use them, etc.), improve the content and features of our Services (such as by personalizing content to your interests), process and complete your transactions, make special offers, provide customer support, process and respond to your queries;</li>
                                <li>To generate and review reports and data about, and to conduct research on, our user base and Service usage patterns;</li>
                                <li>To allow you to participate in interactive features of our Services, if any; or</li>
                                <li>To measure or understand the effectiveness of advertising we serve to you and others, and to deliver relevant advertising to you.</li>
                            </ul>
                            <p>We may combine the information that we receive from third parties with the information you give to us and information we collect about you for the purposes set out above.&nbsp; Further, we may anonymize and/or de-identify information collected from you through the Services or via other means, including via the use of third-party web analytic tools. As a result, our use and disclosure of aggregated and/or de-identified information is not restricted by this Policy, and it may be used and disclosed to others without limitation.</p>
                            <p>We analyze the log files of our Lacarte Platform that may contain Internet Protocol (IP) addresses, browser type and language, Internet service provider (ISP), referring, app crashes, page viewed and exit websites and applications, operating system, date/time stamp, and clickstream data. This helps us to administer the website, to learn about user behavior on the site, to improve our product and services, and to gather demographic information about our user base as a whole.</p>
                        </section>

                        <section>
                            <h2>DISCLOSURE AND DISTRIBUTION OF YOUR INFORMATION</h2>
                            <p>We may share your information that we collect for following purposes:</p>
                            <ul>
                                <li><strong>With Service Providers:</strong> We may share your information with our vendors, consultants, marketing partners, research firms and other service providers or business partners, such as Payment processing companies, to support our business. For example, your information may be shared with outside vendors to send you emails and messages or push notifications to your devices in relation to our Services, to help us analyze and improve the use of our Services, to process and collect payments. We also may use vendors for other projects, such as conducting surveys or organizing sweepstakes for us.</li>
                                <li><strong>With Partner Restaurants/Merchant:</strong> While you place a request to order food through the Lacarte Platform, your information is provided to us and to the restaurants/merchants with whom you may choose to order. In order to facilitate your online food order processing, we provide your information to that restaurant/merchant in a similar manner as if you had made a food order directly with the restaurant. If you provide a mobile phone number, Lacarte may send you text messages regarding the order’s delivery status.</li>
                                <li><strong>For Crime Prevention or Investigation:</strong> We may share this information with governmental agencies or other companies assisting us, when we are:
                                    <ul>
                                        <li>Obligated under the applicable laws or in good faith to respond to court orders and processes; or</li>
                                        <li>Detecting and preventing against actual or potential occurrence of identity theft, fraud, abuse of Services and other illegal acts;</li>
                                        <li>Responding to claims that an advertisement, posting or other content violates the intellectual property rights of a third party;</li>
                                        <li>Under a duty to disclose or share your personal data in order to enforce our Terms of Use and other agreements, policies or to protect the rights, property, or safety of the Company, our customers, or others, or in the event of a claim or dispute relating to your use of our Services. This includes exchanging information with other companies and organizations for the purposes of fraud detection and credit risk reduction.</li>
                                    </ul>
                                </li>
                                <li><strong>For Internal Use:</strong> We may share your information with any present or future member of our “Group” (as defined below)or affiliates for our internal business purposes The term “Group” means, with respect to any person, any entity that is controlled by such person, or any entity that controls such person, or any entity that is under common control with such person, whether directly or indirectly, or, in the case of a natural person, any Relative (as such term is defined in the Companies Act, 1956 and Companies Act, 2013 to the extent applicable) of such person.</li>
                                <li><strong>With Advertisers and advertising networks:</strong> We may work with third parties such as network advertisers to serve advertisements on the Lacarte Platform and on third-party websites or other media (e.g., social networking platforms). These third parties may use cookies, JavaScript, web beacons (including clear GIFs), Flash LSOs and other tracking technologies to measure the effectiveness of their ads and to personalize advertising content to you. While you cannot opt out of advertising on the Lacarte Platform, you may opt out of much interest-based advertising on third party sites and through third party ad networks (including DoubleClick Ad Exchange, Facebook Audience Network and Google AdSense). Opting out means that you will no longer receive personalized ads by third parties ad networks from which you have opted out, which is based on your browsing information across multiple sites and online services. If you delete cookies or change devices, your opt out may no longer be effective.</li>
                                <li>To fulfill the purpose for which you provide it.</li>
                            </ul>
                            <p>We may share your information other than as described in this Policy if we notify you and you consent to the sharing.</p>
                        </section>

                        <section>
                            <h2>DATA SECURITY PRECAUTIONS</h2>
                            <p>We have in place appropriate technical and security measures to secure the information collected by us. The third-party service providers with respect to our payment gateway and payment processing are compliant with the payment card industry standard (generally referred to as PCI compliant service providers). You are advised not to send your full credit/debit card details through unencrypted electronic platforms. Where we have given you (or where you have chosen) a username and password which enables you to access certain parts of the Lacarte Platform, you are responsible for keeping these details confidential. We ask you not to share your password with anyone.</p>
                            <p>Please be aware that the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted through the Lacarte Platform. Once we have received your information, we will use strict physical, electronic, and procedural safeguards to try to prevent unauthorized access.</p>
                        </section>

                        <section>
                            <h2>OPT-OUT</h2>
                            <p>When you sign up for an account, you are opting in to receive emails from Lacarte. You can log in to manage your email preferences or you can follow the “unsubscribe” instructions in commercial email messages, but note that you cannot opt out of receiving certain administrative notices, service notices, or legal notices from Lacarte.</p>
                            <p>If you wish to withdraw your consent for the use and disclosure of your personal information in the manner provided in this Policy, please write to us at <a href="mailto:lacartethe@gmail.com">lacartethe@gmail.com</a>. Please note that we may take time to process such requests, and your request shall take effect no later than 5 (Five) business days from the receipt of such request, after which we will not use your personal data for any processing unless required by us to comply with our legal obligations. We may not be able offer you any or all Services upon such withdrawal of your consent.</p>
                        </section>

                        <section>
                            <h2>GRIEVANCE OFFICER AND LACARTE PLATFORM SECURITY</h2>
                            <p>If you have any queries relating to the processing or usage of information provided by you in connection with this Policy, please email us at&nbsp;<a href="mailto:lacartethe@gmail.com">lacartethe@gmail.com</a> or write to our Grievance Officer at the following address:
                                <br />
                                <strong>
                                F-53, Samrat Prithviraj Chauhan Marg, <br />
                                Chandarwardai Nagar, Ajmer, <br />
                                Ajmer, Rajasthan, 305001, India
                                </strong>
                            </p>
                            <p>If you come across any abuse or violation of the Policy, please report to&nbsp;<a href="mailto:lacartethe@gmail.com">lacartethe@gmail.com</a>.</p>
                            <p>Further, please note that the Lacarte Platform stores your data with the cloud platform of Google Compute Engine provided by Google, Inc., which may store this data on their servers located outside of India. Google Compute Engine has security measures in place to protect the loss, misuse and alteration of the information, details of which are available at&nbsp;<a href="https://cloud.google.com/" target="_blank" rel="noopener noreferrer">https://cloud.google.com/</a>. The privacy policy adopted by Google compute Engine are detailed in&nbsp;<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.&nbsp;In the event you have questions or concerns about the security measures adopted by Google compute Engine, you can contact their data protection / privacy team / legal team or designated the grievance officer at these organizations, whose contact details are available in its privacy policy, or can also write to our Grievance Officer at the address provided above.</p>
                        </section>
                    </article>
                </div>
            </div>
         </>
     );
}

export default Privacy;
