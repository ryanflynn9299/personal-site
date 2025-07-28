'use client'; // This must be a client component to handle state and user interaction.

import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Send, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Metadata can still be exported from a Client Component
const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with Ryan Flynn to discuss projects, collaborations, or opportunities.',
};

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState<SubmissionStatus>('idle');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        // --- Backend Abstraction ---
        // In a real application, you would make an API call here.
        // e.g., await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
        // For this frontend-only implementation, we'll simulate the network delay.
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate a successful outcome
        setStatus('success');
        // To test the error state, you could uncomment the following line:
        // setStatus('error');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
        >
            <header className="text-center">
                <h1 className="font-heading text-4xl font-bold text-slate-50 md:text-5xl">
                    Get In Touch
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                    Have a project in mind, a question, or just want to connect? I'd love to hear from you.
                </p>
            </header>

            <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
                {/* Left Pane: Direct Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">
                            Direct Contact
                        </h2>
                        <p className="mt-2 text-slate-400">
                            For direct inquiries, feel free to reach out via email or connect with me on LinkedIn.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <a
                            href="mailto:ryan.flyn001@gmail.com"
                            className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 transition-colors hover:bg-slate-700"
                        >
                            <Mail className="h-8 w-8 text-sky-300" />
                            <div>
                                <h3 className="font-semibold text-slate-100 group-hover:text-sky-300">Email</h3>
                                <p className="text-sm text-slate-400">ryan.flynn001@gmail.com</p>
                            </div>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/ryan-flynn04/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 transition-colors hover:bg-slate-700"
                        >
                            <Linkedin className="h-8 w-8 text-sky-300" />
                            <div>
                                <h3 className="font-semibold text-slate-100 group-hover:text-sky-300">LinkedIn</h3>
                                <p className="text-sm text-slate-400">Connect with me professionally</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Right Pane: Contact Form */}
                <div>
                    <h2 className="font-heading text-2xl font-semibold text-slate-100">
                        Send a Message
                    </h2>
                    {status === 'success' ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500 bg-slate-800 p-12 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <h3 className="mt-4 font-semibold text-slate-50">Message Sent Successfully!</h3>
                            <p className="mt-2 text-slate-400">Thank you for reaching out. I'll get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">Message</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={5}
                                    placeholder="Your Message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    {status === 'error' && (
                                        <p className="flex items-center gap-2 text-red-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            Something went wrong. Please try again.
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" disabled={status === 'submitting'}>
                                    {status === 'submitting' && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
}