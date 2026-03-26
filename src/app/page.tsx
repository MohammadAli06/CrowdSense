"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radar, IconContainer } from "@/components/ui/radar-effect";
import { HiOutlineStatusOnline, HiOutlineMap, HiOutlineBell } from "react-icons/hi";
import { BsPeopleFill, BsGraphUp } from "react-icons/bs";
import { AiOutlineHeatMap, AiOutlineFileText } from "react-icons/ai";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-sky-500/5 blur-3xl" />

      {/* Top half — text content */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-28 px-6 text-center md:pt-36">
        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
          </span>
          AI-Powered Safety
        </motion.div>

        {/* Giant heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          CrowdSense
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg md:text-xl"
        >
          Real-time crowd density monitoring and safety alert system for
          stadiums, festivals, transit hubs and public events
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:bg-sky-400 hover:shadow-sky-500/40 hover:scale-105"
          >
            View Live Dashboard
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-7 py-3.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-slate-500 hover:text-white hover:scale-105">
            See How It Works
          </button>
        </motion.div>
      </section>

      {/* Bottom half — radar hero */}
      <section className="relative z-10 mt-16 flex items-center justify-center px-6 pb-40 md:mt-24 lg:mt-32">
        <div className="relative mx-auto h-[28rem] w-full max-w-3xl">
          {/* Row 1: 3 icons */}
          <div className="absolute top-0 left-0 right-0 flex justify-between px-8 md:px-16">
            <IconContainer
              icon={<HiOutlineStatusOnline className="h-6 w-6 text-sky-400" />}
              text="Live Detection"
              delay={0.2}
            />
            <IconContainer
              icon={<HiOutlineMap className="h-6 w-6 text-sky-400" />}
              text="Density Mapping"
              delay={0.3}
            />
            <IconContainer
              icon={<HiOutlineBell className="h-6 w-6 text-sky-400" />}
              text="Zone Alerts"
              delay={0.4}
            />
          </div>

          {/* Row 2: 2 icons */}
          <div className="absolute top-28 left-0 right-0 flex justify-around px-24 md:px-40">
            <IconContainer
              icon={<BsPeopleFill className="h-6 w-6 text-sky-400" />}
              text="Crowd Flow"
              delay={0.5}
            />
            <IconContainer
              icon={<AiOutlineHeatMap className="h-6 w-6 text-sky-400" />}
              text="Heatmap View"
              delay={0.6}
            />
          </div>

          {/* Row 3: 2 icons */}
          <div className="absolute top-56 left-0 right-0 flex justify-around px-16 md:px-32">
            <IconContainer
              icon={<HiOutlineBell className="h-6 w-6 text-sky-400" />}
              text="Alert Logs"
              delay={0.7}
            />
            <IconContainer
              icon={<AiOutlineFileText className="h-6 w-6 text-sky-400" />}
              text="Reports"
              delay={0.8}
            />
          </div>

          {/* Radar */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <Radar className="h-[26rem] w-[26rem]" />
          </div>
        </div>
      </section>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
    </main>
  );
}
