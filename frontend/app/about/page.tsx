"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-cream">
      <section className="relative min-h-screen overflow-hidden pt-28 pb-16 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-pale-latte/20 via-cream to-mist-gray/10" />

        <div className="absolute inset-0">
          <div className="grid h-full w-full gap-0 lg:grid-cols-2">
            <div className="relative h-full">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 scale-105 bg-cover bg-center blur-[6px] brightness-90"
                  style={{ backgroundImage: "url('/images/drinks2.JPG')" }}
                />
                <div className="absolute inset-0 bg-deep-coffee/45" />
              </motion.div>
            </div>
            <div className="relative h-full">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px] brightness-105"
                  style={{ backgroundImage: "url('/images/drinks.png')" }}
                />
                <div className="absolute inset-0 bg-deep-coffee/10 mix-blend-luminosity" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-8rem)] items-center">
          <div className="editorial-container">
            <div className="max-w-3xl bg-cream/55 p-10 shadow-xl backdrop-blur">
              <h1 className="editorial-h1 mb-6 text-deep-coffee tracking-tight">
                ABOUT LATTELINK
              </h1>
              <div className="space-y-4">
                <p className="editorial-body text-deep-coffee/80">
                  I love working at cafés: the smell of freshly brewed coffee, the gentle hum of
                  conversation, and the energy of people around me, whether they are studying for an exam or
                  sharing a conversation with a friend. There is something about that environment that helps
                  me focus and feel connected at the same time.
                </p>
                <p className="editorial-body text-deep-coffee/80">
                  But as much as I enjoy it, I often run into the same issues that make it hard to stay as
                  long as I’d like. Some cafés have unreliable Wi-Fi that makes completing classwork
                  frustrating, while others don’t have enough outlets, forcing me to leave early when my
                  laptop battery runs low. These small inconveniences add up, and I realized that other
                  students and remote workers probably experience the same thing.
                </p>
                <p className="editorial-body text-deep-coffee/80">
                  That inspired me to create a full-stack website that collects information from Google and
                  (soon) Yelp reviews to show how “workable” different cafés are, highlighting details like
                  outlet availability, Wi-Fi quality, and seating comfort. I wanted the design to feel as
                  warm and calm as the places it represents, with neutral, coffee-inspired tones and a clean,
                  cozy layout. I hope this project grows from a simple personal need into something that
                  could make finding the perfect study spot easier for anyone who enjoys the atmosphere of a
                  good café as much as I do.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="https://www.hoangnatalie.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-caption inline-flex items-center gap-2 border-b-2 border-mist-gray text-deep-coffee/80 transition-colors duration-300 hover:text-deep-coffee"
                >
                  VISIT MY PORTFOLIO →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


