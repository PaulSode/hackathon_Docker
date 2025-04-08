'use client';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 pt-22">
            <div className="max-w-4xl mx-auto p-6">
                {/* Title */}
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">Privacy Policy</h1>

                {/* Content */}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Introduction</h2>
                        <p className="text-gray-600">
                            At Rettewt, we value not being sued. We also value somewhat your privacy and are committed to protecting your personal information.
                            This Privacy Policy outlines the types of data we collect and how we use and safeguard it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Information We Collect</h2>
                        <p className="text-gray-600">
                            We may collect the following types of information when you use our services:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                            <li>Personal information, such as your name, email address, and contact details.</li>
                            <li>Usage data, such as the pages you visit, and the time spent on our site.</li>
                            <li>The name of your firstborn for absolutely no reason.</li>
                            <li>Cookies to enhance your experience on our website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">How We Use Your Information</h2>
                        <p className="text-gray-600">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                            <li>Provide and improve our services.</li>
                            <li>Personalize your experience on our platform.</li>
                            <li>Make money.</li>
                            <li>Communicate with you about updates, offers, and promotions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Data Security</h2>
                        <p className="text-gray-600">
                            We take reasonable measures (none) to protect your data from unauthorized access, alteration, or deletion. However, no method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Your Rights</h2>
                        <p className="text-gray-600">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600">
                            <li>Access the personal data we have about you.</li>
                            <li>Request corrections to any inaccurate data.</li>
                            <li>Request the deletion of your data within 3 years in accordance with applicable laws.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Changes to This Policy</h2>
                        <p className="text-gray-600">
                            We may update this Privacy Policy from time to time just to screw you. Any changes will be posted on this page with an updated revision date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800">Contact Us</h2>
                        <p className="text-gray-600">
                            If you have any questions about this Privacy Policy or how we handle your data, feel free to contact us at <strong>support@rettewt.com</strong>. This email may or may not exist and you question may be sent in the void.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
