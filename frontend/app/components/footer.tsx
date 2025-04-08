'use client';

export default function Footer() {
    return (
        <footer className="bg-white shadow-md p-6 mt-8 border-t">
            <div className="max-w-4xl mx-auto flex justify-between items-center text-gray-600">
                {/* Footer Left Content */}
                <div>
                    <p className="text-sm">&copy; 2025 Rettewt. All rights reserved.</p>
                </div>

                {/* Footer Links */}
                <div className="flex space-x-6 text-sm">
                    <a href="/about" className="hover:text-blue-600">About</a>
                    <a href="/contact" className="hover:text-blue-600">Contact</a>
                    <a href="/privacy" className="hover:text-blue-600">Privacy</a>
                    <a href="/terms" className="hover:text-blue-600">Terms</a>
                </div>
            </div>
        </footer>
    );
}
