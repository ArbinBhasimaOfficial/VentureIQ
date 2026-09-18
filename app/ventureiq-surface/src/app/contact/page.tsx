"use client";

import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const businessSizes = [
  "Enterprise (1,000+ Employees)",
  "Large (201-999 Employees)",
  "Medium (51-200 Employees)",
  "Small (0-50 Employees)",
];

const roles = [
  "Student",
  "Entry Level",
  "Associate",
  "Consultant",
  "Librarian",
  "Academic or Faculty",
  "Mid-senior",
  "Director, Vice President, President",
  "C-Suite",
  "Founder or Owner",
];

const departments = [
  "Brand Management",
  "Category Management",
  "Competitive Intelligence",
  "Insights/Knowledge Center",
  "Legal, Compliance, Procurement and Regulatory",
  "Marketing",
  "Product Development and Innovation",
  "Research & Development",
  "Sales",
  "Strategy and Planning",
  "Other",
];

const industries = [
  "Academic",
  "Advertising and Marketing",
  "Automotive",
  "Beauty and Personal Care",
  "Building Materials",
  "Civil Engineering",
  "Construction",
  "Consumer Electronics",
  "Consumer Packaged Goods",
  "Education and Libraries",
  "Facilities Services",
  "Financial Services",
  "Food and Drink",
  "Government",
  "Health and Wellness",
  "Hospitality",
  "Household",
  "Industrial Automation",
  "Ingredients, Flavours and Fragrances",
  "Insurance",
  "Law Practice",
  "Legal Services",
  "Logistics & Supply Chain",
  "Machinery",
  "Mechanical or Industrial Engineering",
  "Media, Content Producers",
  "Mining & Metals",
  "Oil & Energy",
  "Other",
  "Packaging",
  "Professional Services",
  "Retail",
  "Security & Investigations",
  "Sports, Gaming and Entertainment",
  "TV, Phone and Internet",
  "Technology",
  "Travel and Tourism",
  "Utilities",
];

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, name, type = "text", placeholder, required = true }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
      />
    </label>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <select
        name={name}
        required
        defaultValue=""
        className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,254,255,0.72))] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(9,9,11,0.98),rgba(8,47,73,0.45))]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-28">
            <div className="flex flex-col justify-between lg:min-h-[560px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">
                  Get in touch
                </p>
                <h1 className="mt-6 max-w-xl text-5xl font-bold tracking-tight sm:text-6xl">
                  Let&apos;s make your next decision clearer.
                </h1>
                <p className="mt-7 max-w-lg text-base leading-8 text-zinc-600 dark:text-zinc-400 sm:text-lg">
                  Would you like to see how VentureIQ will work for your business? Submit the form
                  and a member of our team will be in touch.
                </p>
              </div>

              <div className="mt-14 grid gap-5 border-t border-zinc-200 pt-7 dark:border-zinc-800">
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <Mail className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                  Tailored market intelligence
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <Phone className="h-5 w-5 text-cyan-500" aria-hidden="true" />A conversation built
                  around your goals
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                  Global insight, local relevance
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-2xl shadow-cyan-950/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/85 sm:p-9">
              {submitted ? (
                <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-16 w-16 text-cyan-400" aria-hidden="true" />
                  <h2 className="mt-7 text-3xl font-bold tracking-tight">
                    Thanks for reaching out.
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    Your details have been received. A member of our team will be in touch soon to
                    learn more about your goals.
                  </p>
                  <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition hover:bg-zinc-950 hover:text-cyan-400 dark:hover:bg-white"
                  >
                    Back to home
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-9">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
                      Tell us about you
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight">Start a conversation</h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First Name" name="firstName" placeholder="First name" />
                    <Field label="Last Name" name="lastName" placeholder="Last name" />
                    <Field
                      label="Business Email Address"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                    />
                    <SelectField label="Company Size" name="companySize" options={businessSizes} />
                    <Field
                      label="Business Phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 000 000 0000"
                    />
                    <Field label="Company Name" name="companyName" placeholder="Company name" />
                    <SelectField label="Role" name="role" options={roles} />
                    <SelectField label="Department" name="department" options={departments} />
                    <SelectField label="Industry" name="industry" options={industries} />
                    <Field label="Location" name="location" placeholder="City, country" />
                  </div>

                  <label className="flex items-start gap-3 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                    />
                    <span>
                      By submitting this form, you agree to VentureIQ&apos;s{" "}
                      <a
                        href="https://www.mintel.com/terms-of-use/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-cyan-600 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-400 dark:text-cyan-400"
                      >
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://www.mintel.com/privacy-policy/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-cyan-600 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-400 dark:text-cyan-400"
                      >
                        Privacy Policy
                      </a>
                      . You consent to receive marketing communications from VentureIQ and its
                      affiliated companies. You can unsubscribe at any time.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-lg shadow-cyan-500/10 transition hover:bg-zinc-950 hover:text-cyan-400 hover:ring-1 hover:ring-cyan-400 active:scale-[0.99] dark:hover:bg-white"
                  >
                    Submit inquiry
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
