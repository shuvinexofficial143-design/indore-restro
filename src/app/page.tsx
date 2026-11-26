import { restaurant } from "@/lib/restaurant";
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-16 sm:px-12">
      <div className="border-y border-royal-gold/40 py-12">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-royal-gold">{restaurant.agency} · Development preview</p>
        <h1 className="font-serif text-5xl leading-tight sm:text-7xl">{restaurant.name}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-royal-cream/80">A fictional restaurant concept in Indore. The restaurant website, mobile ordering and staff management system are under development.</p>
        <p className="mt-8 text-sm text-royal-gold">Phase 0 · Foundation only. No orders, bookings or payments are accepted yet.</p>
      </div>
      <footer className="mt-8 text-sm text-royal-cream/70">Powered by Shuvi 360 · Demonstration project</footer>
    </main>
  );
}
