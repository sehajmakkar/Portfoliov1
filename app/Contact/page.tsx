"use client";

import Container from "@/components/containers";
import { Github, Linkedin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import DisplacementText from "@/components/ui/displacement-text";
import { toast } from "sonner";
import { FlightButton } from "@/components/ui/flight-button";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.message.trim() !== "";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/sehajmakkar007@gmail.com",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        toast.success("Message sent! I'll get back to you soon.");
        form.reset();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden font-sans">
      <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
        {/* Background Pattern & Borders */}
        <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          <span className="link--elara">Contact</span>
        </h1>
        <p className="font-custom2 mt-2 mb-12 max-w-lg text-sm tracking-tight text-neutral-600 md:text-base dark:text-neutral-400">
          Hi there — I’m currently open to meaningful work.
        </p>

        <div className="relative z-10 w-full max-w-2xl p-0 md:p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FormSubmit Configuration */}
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input
              type="hidden"
              name="_subject"
              value="New Submission from Portfolio"
            />
            <input type="text" name="_honey" style={{ display: "none" }} />

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Tyler Durden"
                className="font-custom2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tyler@projectmayhem.com"
                className="font-custom2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="You're crazy good, never change."
                className="font-custom2 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <div className="flex w-full justify-center">
              <FlightButton
                type="submit"
                className="w-32"
                disabled={isSubmitting || !isFormValid}
              />
            </div>
          </form>

          <div className="font-custom2 mt-10 flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 md:flex-row dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <p>Sehaj</p>
            </div>

            {/* Displacement Text - Visible and Hoverable */}
            {/* Displacement Text - Visible and Hoverable */}

            <div className="flex items-center gap-4">
              <a
                href="https://x.com/sehajmakkarr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter
                  size={14}
                  className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/sehajmakkar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin
                  size={14}
                  className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
                />
              </a>
              <a
                href="https://github.com/sehajmakkar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github
                  size={14}
                  className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="relative -mt-20 flex h-96 w-full items-center justify-center overflow-hidden">
          <DisplacementText
            text="SEHAJ"
            fontSize={300}
            className="h-full w-full"
            lightColor="#171717"
            darkColor="#e5e5e5"
          />
        </div>
      </Container>
    </div>
  );
}
