import Link from 'next/link';
import { Twitter } from 'lucide-react';
import { AletheiaLogo } from './AletheiaLogo';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={`w-full py-12 px-6 border-t border-white/5 mt-auto ${className || 'bg-background'}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1 min-w-8">
                            <AletheiaLogo className="w-6 h-6 text-accent" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Aletheia
                        </span>
                    </Link>
                    <p className="text-sm text-text-tertiary max-w-xs">
                        The fully automated, multi-threaded footprinting engine for advanced threat intelligence synthesis.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-accent transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
                    <ul className="space-y-3 text-sm text-text-secondary">
                        <li><Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link></li>
                        <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                        <li><Link href="/founder" className="hover:text-accent transition-colors">Founder & Vision</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Compliance</h3>
                    <ul className="space-y-3 text-sm text-text-secondary">
                        <li><Link href="/ethics" className="hover:text-accent transition-colors">Ethics Framework</Link></li>
                        <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
                    <ul className="space-y-3 text-sm text-text-secondary">
                        <li><Link href="/faqs" className="hover:text-accent transition-colors">FAQs</Link></li>
                        <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-text-tertiary">
                <p>© {new Date().getFullYear()} Aletheia Intelligence. All rights reserved.</p>
                <p className="mt-2 md:mt-0">Built for analysts, by analysts.</p>
            </div>
        </footer>
    );
}
