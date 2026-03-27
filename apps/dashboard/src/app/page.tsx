"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Radar, IconContainer } from "@/components/ui/radar-effect";
import { HiOutlineStatusOnline, HiOutlineMap, HiOutlineBell } from "react-icons/hi";
import { BsPeopleFill, BsGraphUp } from "react-icons/bs";
import { AiOutlineHeatMap, AiOutlineFileText } from "react-icons/ai";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen w-full overflow-hidden bg-black pt-20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-sky-500/5 blur-3xl" />

      {/* Top half — text content */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-8 px-6 text-center md:pt-12">
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

      {/* Stats Section */}
      <section className="relative z-10 mt-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8">
            {/* Stat Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-4xl font-bold text-white">
                2,<span className="text-sky-500">896</span>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                People Detected
              </div>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center border-l border-slate-800"
            >
              <div className="text-4xl font-bold text-sky-500">12</div>
              <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Active Zones
              </div>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center border-l border-slate-800"
            >
              <div className="text-4xl font-bold text-red-500">3</div>
              <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                High Density<br />Alerts
              </div>
            </motion.div>

            {/* Stat Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center border-l border-slate-800"
            >
              <div className="text-4xl font-bold text-sky-500">
                98<span className="text-2xl">%</span>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Detection Accuracy
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <section className="relative z-10 mt-12 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 rounded-xl border border-red-900/50 bg-red-950/30 backdrop-blur-sm px-6 py-4"
          >
            <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Zone B — Gate 4</span> has exceeded safe threshold · 847 people detected in 200m² area
              </p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center rounded-md bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 uppercase">
              Critical
            </span>
          </motion.div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="relative z-10 mt-24 px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-2xl font-bold tracking-wider text-slate-400 uppercase md:text-3xl"
          >
            Platform Capabilities
          </motion.h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <HiOutlineStatusOnline className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Live detection</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                YOLOv8 processes video frames in real time with bounding boxes and people count per zone
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <AiOutlineHeatMap className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Density heatmap</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Color-coded overlay shows safe, moderate and critical zones at a glance across the venue
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <HiOutlineBell className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Zone alerts</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Instant notifications when crowd density exceeds configured thresholds per zone
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <BsPeopleFill className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multi-feed monitoring</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Connect multiple CCTV or IP cameras and monitor all zones simultaneously on one screen
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <BsGraphUp className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Crowd flow prediction</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                ML model forecasts crowd movement trends to help staff prepare before surges happen
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                <HiOutlineMap className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">GPS density map</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Anonymous GPS aggregation shows macro crowd levels across an entire city or event area
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
      </main>
    </>
  );
}
