"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  Droplets,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPin,
  MoreHorizontal,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

type Village = {
  name: string;
  code: string;
  state: string;
  district: string;
  taluka: string;
  population: number;
  malePopulation: number;
  femalePopulation: number;
  literacyRate: number;
  panchayat: string;
  pinCode: string;
  constituency: string;
  updatedAt: string;
};

type VillageDetailProps = { village: Village };

const infrastructure = [
  { label: "Schools", description: "3 institutions", status: "Available", icon: GraduationCap, color: "text-sky-300", bg: "bg-sky-400/10" },
  { label: "Primary health", description: "1 PHC nearby", status: "Available", icon: HeartPulse, color: "text-rose-300", bg: "bg-rose-400/10" },
  { label: "Banking", description: "2 branches", status: "Limited", icon: WalletCards, color: "text-amber-300", bg: "bg-amber-400/10" },
  { label: "Water supply", description: "Piped · 82% homes", status: "Available", icon: Droplets, color: "text-cyan-300", bg: "bg-cyan-400/10" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export default function VillageDetail({ village }: VillageDetailProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  async function shareVillage() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${village.name} village | GramPulse`, url });
        setShareMessage("Village shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Link copied to clipboard");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Could not share. Please try again.");
    }
    window.setTimeout(() => setShareMessage(""), 3000);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b120e] text-white selection:bg-emerald-400/30">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 top-20 h-[32rem] w-[32rem] rounded-full bg-emerald-500/[0.08] blur-[120px]" />
        <div className="absolute -right-52 top-[28rem] h-[30rem] w-[30rem] rounded-full bg-teal-500/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,54,38,0.28),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[76px] shrink-0 flex-col items-center border-r border-white/[0.06] py-7 lg:flex">
          <a href="#" aria-label="GramPulse home" className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-[#062013] shadow-[0_0_26px_rgba(16,185,129,0.28)]">
            <Sparkles size={19} strokeWidth={2.2} />
          </a>
          <div className="mt-12 flex flex-col gap-3">
            <a href="#overview" aria-label="Village overview" className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.08] text-emerald-300"><MapPin size={18} /></a>
            <a href="#administration" aria-label="Administration" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><Landmark size={18} /></a>
            <a href="#services" aria-label="Public services" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><HeartPulse size={18} /></a>
          </div>
          <button aria-label="Help" className="mt-auto grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><CircleHelp size={18} /></button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-5 sm:px-8 lg:px-11">
            <a href="#" className="flex items-center gap-2.5 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-[#062013]"><Sparkles size={16} /></span>
              <span className="text-sm font-semibold tracking-tight">Gram<span className="text-emerald-400">Pulse</span></span>
            </a>
            <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
              <span className="font-medium text-slate-300">Directory</span><ChevronRight size={14} />
              <span>Village profile</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[11px] font-medium tracking-wide text-emerald-200 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> VERIFIED DATA
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-xs font-semibold text-slate-200">GP</div>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] px-5 pb-12 pt-7 sm:px-8 sm:pt-10 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <a href="#" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-emerald-300">
                <ArrowLeft size={14} /> Back to directory
              </a>

              <section id="overview" className="glass-panel relative overflow-hidden rounded-[26px] p-6 sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full border border-emerald-200/[0.06]" />
                <div className="pointer-events-none absolute -right-4 -top-20 h-64 w-64 rounded-full border border-emerald-200/[0.06]" />
                <div className="pointer-events-none absolute right-[13%] top-12 h-36 w-36 rounded-full bg-emerald-400/[0.08] blur-[70px]" />
                <div className="relative">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{village.state}</span><ChevronRight size={13} /><span>{village.district}</span><ChevronRight size={13} /><span>{village.taluka}</span>
                    </div>
                    <button aria-label="More options" className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"><MoreHorizontal size={18} /></button>
                  </div>

                  <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-emerald-200">
                          <ShieldCheck size={13} /> {village.code}
                        </span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] text-slate-400">Village profile</span>
                      </div>
                      <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">{village.name}</h1>
                      <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <MapPin size={15} className="text-emerald-400" /> A coastal village in {village.district}, {village.state}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => setBookmarked((current) => !current)}
                        aria-pressed={bookmarked}
                        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition duration-200 hover:-translate-y-0.5 ${bookmarked ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.08]"}`}
                      >
                        {bookmarked ? <Check size={15} /> : <Bookmark size={15} />}
                        {bookmarked ? "Saved" : "Save"}
                      </button>
                      <button onClick={shareVillage} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-xs font-medium text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]">
                      <Share2 size={15} /> <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                  </div>
                  <div aria-live="polite" className="sr-only">{shareMessage}</div>
                </div>
              </section>

              <div className="mb-4 mt-9 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">Village at a glance</p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white">Community snapshot</h2>
                </div>
                <span className="text-[11px] text-slate-600">Census data · 2011</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
                <section className="glass-panel rounded-[22px] p-5 sm:p-6 md:col-span-2 xl:col-span-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Total population</p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{formatNumber(village.population)} <span className="text-sm font-normal tracking-normal text-slate-500">people</span></p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/10 bg-emerald-300/[0.07] text-emerald-300"><Users size={18} /></div>
                  </div>
                  <div className="mt-7">
                    <div className="mb-2.5 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Male <b className="font-medium text-slate-200">{formatNumber(village.malePopulation)}</b></span>
                        <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-teal-300" /> Female <b className="font-medium text-slate-200">{formatNumber(village.femalePopulation)}</b></span>
                      </div>
                      <span className="hidden text-slate-500 sm:inline">48% / 52%</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="w-[48%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
                      <div className="ml-1 w-[52%] rounded-full bg-gradient-to-r from-teal-400 to-teal-200" />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
                    <div className="rounded-xl bg-white/[0.025] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><ArrowUpRight size={12} className="text-emerald-400" /> Male residents</div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-200">953 <span className="text-[10px] font-normal text-slate-500">per 1,000 female</span></p>
                    </div>
                    <div className="rounded-xl bg-white/[0.025] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><ArrowDownRight size={12} className="text-teal-300" /> Population density</div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-200">2,814 <span className="text-[10px] font-normal text-slate-500">per km²</span></p>
                    </div>
                  </div>
                </section>

                <section id="administration" className="glass-panel rounded-[22px] p-5 sm:p-6 xl:col-span-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Literacy rate</p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{village.literacyRate}<span className="text-xl text-emerald-300">%</span></p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-sky-300/10 bg-sky-300/[0.07] text-sky-300"><GraduationCap size={19} /></div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Well above the national average</p>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-[10px] text-slate-500"><span>Village</span><span>India average <b className="font-medium text-slate-300">74.0%</b></span></div>
                    <div className="relative h-2 rounded-full bg-white/[0.07]">
                      <div className="h-full w-[96.8%] rounded-full bg-gradient-to-r from-sky-500 to-emerald-300" />
                      <span className="absolute left-[74%] top-1/2 h-3.5 w-px -translate-y-1/2 bg-white/70" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-3">
                    <span className="text-[11px] text-slate-400">vs. national average</span>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">+22.8 pts</span>
                  </div>
                </section>

                <section className="glass-panel rounded-[22px] p-5 sm:p-6 xl:col-span-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">Local governance</p>
                      <h3 className="mt-1 text-sm font-semibold text-white">Administrative details</h3>
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-400"><Landmark size={17} /></div>
                  </div>
                  <div className="divide-y divide-white/[0.055]">
                    <InfoRow label="Grama Panchayat" value={village.panchayat} />
                    <InfoRow label="PIN code" value={village.pinCode} />
                    <InfoRow label="Assembly constituency" value={village.constituency} />
                  </div>
                </section>

                <section id="services" className="glass-panel rounded-[22px] p-5 sm:p-6 xl:col-span-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">Essential services</p>
                      <h3 className="mt-1 text-sm font-semibold text-white">Local infrastructure</h3>
                    </div>
                    <button className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-emerald-300">View all <ChevronRight size={13} /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {infrastructure.map(({ label, description, status, icon: Icon, color, bg }) => (
                      <div key={label} className="group flex items-center gap-3 rounded-[15px] border border-white/[0.055] bg-white/[0.025] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.045]">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg} ${color}`}><Icon size={18} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-200">{label}</p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-500">{description}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-medium ${status === "Available" ? "bg-emerald-400/[0.09] text-emerald-300" : "bg-amber-400/[0.09] text-amber-300"}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.055] pt-4 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Information sourced from LGD &amp; Census of India</span>
                <span>Last updated {village.updatedAt}</span>
              </footer>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="shrink-0 text-[11px] text-slate-500">{label}</span>
      <span className="text-right text-xs font-medium text-slate-200">{value}</span>
    </div>
  );
}
