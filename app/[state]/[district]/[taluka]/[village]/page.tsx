import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Users, BookOpen, Home, Briefcase, MapPin, Landmark } from 'lucide-react';

interface PageProps {
  params: Promise<{
    state: string;
    district: string;
    taluka: string;
    village: string;
  }>;
}

// 1. Data Fetcher
async function getVillageData(stateSlug: string, districtSlug: string, talukaSlug: string, villageSlug: string) {
  const { data, error } = await supabase
    .from('villages')
    .select('*')
    .match({
      state_slug: decodeURIComponent(stateSlug).toLowerCase(),
      district_slug: decodeURIComponent(districtSlug).toLowerCase(),
      taluka_slug: decodeURIComponent(talukaSlug).toLowerCase(),
      slug: decodeURIComponent(villageSlug).toLowerCase(),
    })
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 2. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, district, taluka, village } = await params;
  const data = await getVillageData(state, district, taluka, village);

  if (!data) {
    return {
      title: 'Village Not Found | GramPulse',
    };
  }

  const title = `${data.name} Village - ${data.taluka}, ${data.district} | GramPulse`;
  const description = `Complete demographic profile of ${data.name} village in ${data.taluka} taluka, ${data.district} district, ${data.state}. Population: ${data.population?.toLocaleString() || 'N/A'}, Literacy: ${data.literacy_rate || 'N/A'}%, Pincode: ${data.pincode || 'N/A'}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'en_IN',
    },
    alternates: {
      canonical: `/${data.state_slug}/${data.district_slug}/${data.taluka_slug}/${data.slug}`,
    },
  };
}

// 3. Dynamic Village Profile Page
export default async function VillagePage({ params }: PageProps) {
  const { state, district, taluka, village } = await params;
  const data = await getVillageData(state, district, taluka, village);

  if (!data) {
    notFound();
  }

  const stats = [
    { label: 'Total Population', value: data.population?.toLocaleString() ?? 'N/A', icon: Users, color: 'text-blue-500' },
    { label: 'Literacy Rate', value: data.literacy_rate ? `${data.literacy_rate}%` : 'N/A', icon: BookOpen, color: 'text-emerald-500' },
    { label: 'Sex Ratio', value: data.sex_ratio ? `${data.sex_ratio} / 1000 ♂` : 'N/A', icon: Users, color: 'text-rose-500' },
    { label: 'Total Households', value: data.households?.toLocaleString() ?? 'N/A', icon: Home, color: 'text-amber-500' },
    { label: 'Working Population', value: data.working_pop?.toLocaleString() ?? 'N/A', icon: Briefcase, color: 'text-purple-500' },
    { label: 'Postal PIN Code', value: data.pincode ?? 'N/A', icon: MapPin, color: 'text-cyan-500' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="capitalize">{data.state}</span>
          <span>/</span>
          <span className="capitalize">{data.district}</span>
          <span>/</span>
          <span className="capitalize">{data.taluka}</span>
          <span>/</span>
          <span className="text-white font-medium">{data.name}</span>
        </nav>

        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block text-xs uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md mb-2">
                LGD Code: {data.lgd_code || 'N/A'}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                {data.name}
              </h1>
              <p className="text-slate-400 mt-2 text-base sm:text-lg">
                Taluka: <span className="text-slate-200">{data.taluka}</span> • District: <span className="text-slate-200">{data.district}</span>
              </p>
            </div>
            
            {(data.panchayat || data.assembly) && (
              <div className="flex flex-col gap-1 text-sm text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-lg">
                {data.panchayat && (
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Gram Panchayat: <strong className="text-slate-200">{data.panchayat}</strong></span>
                  </div>
                )}
                {data.assembly && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Assembly: <strong className="text-slate-200">{data.assembly}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Demographic Stats Grid */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Demographics & Key Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition p-5 rounded-xl flex items-center gap-4 shadow-sm"
                >
                  <div className={`p-3 rounded-lg bg-slate-800/80 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Structured Data (JSON-LD) for Search Engine Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Place',
              name: data.name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: data.taluka,
                addressRegion: data.district,
                addressCountry: 'IN',
                postalCode: data.pincode || undefined,
              },
            }),
          }}
        />
      </div>
    </main>
  );
}
