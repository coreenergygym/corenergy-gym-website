import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { buildWhatsAppLink } from '../lib/whatsapp'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import type { GymSettings, Membership, ServiceItem } from '../types'

const GALLERY_FALLBACK = [
  '/images/gym-1.jpg',
  '/images/gym-2.jpg',
  '/images/gym-3.jpg',
  '/images/gym-4.jpg',
  '/images/gym-5.jpg',
  '/images/gym-6.jpg',
  '/images/gym-7.jpg',
  '/images/gym-8.jpg',
]

const DEFAULT_BENEFITS = [
  { title: 'Modern Equipment', copy: 'A full floor of strength machines, free weights, and cardio equipment kept in working order.' },
  { title: 'Expert Trainers', copy: 'Guidance from trainers who correct your form, not just count your reps.' },
  { title: 'Clean & Professional Environment', copy: 'A space built for training, kept the way a serious gym should be kept.' },
  { title: 'Flexible Timings', copy: 'Hours structured around people who work — early mornings and evenings included.' },
  { title: 'Personalized Fitness Support', copy: 'Programs built around your goals, not a one-size-fits-all routine.' },
]

export default function Home() {
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [gallery, setGallery] = useState<string[]>(GALLERY_FALLBACK)

  useEffect(() => {
    supabase.from('gym_settings').select('*').maybeSingle().then(({ data }) => {
      if (data) setSettings(data as GymSettings)
    })
    supabase
      .from('memberships')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => data && setMemberships(data as Membership[]))
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => data && setServices(data as ServiceItem[]))
    supabase
      .from('gallery_photos')
      .select('image_url')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setGallery(data.map((g) => g.image_url))
      })
  }, [])

  const whatsapp = settings?.whatsapp_number || ''

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${GALLERY_FALLBACK[2]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">
            {settings?.gym_name || 'CoreNergy The Gym'}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Train with purpose.
            <br /> Build real strength.
          </h1>
          <p className="mt-6 max-w-xl text-base text-steel">
            A serious training environment with modern equipment and trainers who actually
            pay attention. Come see it for yourself.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/book-trial"
              className="rounded-full bg-volt px-7 py-3.5 font-semibold text-white transition hover:bg-voltLight"
            >
              Book Free Trial
            </Link>
            <a
              href="#services"
              className="rounded-full border border-line px-7 py-3.5 font-semibold text-white transition hover:border-steel"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {DEFAULT_BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-panel p-6">
              <h3 className="text-lg font-semibold text-white">{b.title}</h3>
              <p className="mt-2 text-sm text-steel">{b.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">About</p>
            <h2 className="mt-3 text-4xl text-white">Why train at CoreNergy</h2>
            <p className="mt-5 text-steel">
              {settings?.about_text ||
                'CoreNergy The Gym is built around real equipment, real coaching, and a training floor that stays clean and organized. Whether you\'re starting out or training seriously, the environment is set up to support consistent progress — not to look good in a photo.'}
            </p>
            <Link
              to="/register"
              className="mt-6 inline-block rounded-full bg-volt px-6 py-3 font-semibold text-white transition hover:bg-voltLight"
            >
              Start Your Fitness Journey
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={GALLERY_FALLBACK[4]} alt="Cardio floor at CoreNergy The Gym" className="col-span-2 h-64 w-full rounded-2xl object-cover" loading="lazy" />
            <img src={GALLERY_FALLBACK[1]} alt="Strength training area" className="h-40 w-full rounded-2xl object-cover" loading="lazy" />
            <img src={GALLERY_FALLBACK[3]} alt="Free weights section" className="h-40 w-full rounded-2xl object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-y border-line bg-panel/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">Services</p>
          <h2 className="mt-3 text-4xl text-white">What we offer</h2>

          {services.length === 0 ? (
            <p className="mt-6 max-w-xl text-steel">
              Services will appear here once they're added in Admin → Services. Add categories like
              General Fitness, Personal Training, or Group Classes to get started.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div key={s.id} className="rounded-2xl border border-line bg-ink p-6">
                  <h3 className="text-xl font-semibold text-white">{s.name}</h3>
                  {s.description && <p className="mt-2 text-sm text-steel">{s.description}</p>}
                  {s.features?.length > 0 && (
                    <ul className="mt-4 space-y-1 text-sm text-steel">
                      {s.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MEMBERSHIPS */}
      <section id="memberships" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">Memberships</p>
        <h2 className="mt-3 text-4xl text-white">Plans</h2>

        {memberships.length === 0 ? (
          <p className="mt-6 max-w-xl text-steel">
            Membership plans will show up here once they're added in Admin → Memberships.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m) => (
              <div key={m.id} className="flex flex-col rounded-2xl border border-line bg-panel p-6">
                <h3 className="text-xl font-semibold text-white">{m.name}</h3>
                <p className="mt-1 text-sm text-steel">{m.duration_label}</p>
                <p className="mt-4 text-3xl text-white">₹{m.price}</p>
                {m.description && <p className="mt-3 text-sm text-steel">{m.description}</p>}
                {m.features?.length > 0 && (
                  <ul className="mt-4 flex-1 space-y-1 text-sm text-steel">
                    {m.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                )}
                <Link
                  to={`/register?plan=${encodeURIComponent(m.name)}`}
                  className="mt-6 rounded-full bg-volt px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-voltLight"
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="border-y border-line bg-panel/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">Gallery</p>
          <h2 className="mt-3 text-4xl text-white">Inside CoreNergy</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={`CoreNergy The Gym facility photo ${i + 1}`}
                className="h-48 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-4xl text-white">Ready to start?</h2>
        <p className="mx-auto mt-3 max-w-md text-steel">
          Book a free trial or reach out directly — whichever's easier for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/book-trial" className="rounded-full bg-volt px-7 py-3.5 font-semibold text-white hover:bg-voltLight">
            Book Free Trial
          </Link>
          {whatsapp ? (
            <WhatsAppButton phone={whatsapp} message="Hi! I'd like to know more about CoreNergy The Gym memberships." label="Ask on WhatsApp" />
          ) : (
            <a
              href={settings?.instagram_url || 'https://www.instagram.com/corenergy_thegym/'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-line px-7 py-3.5 font-semibold text-white hover:border-steel"
            >
              Message us on Instagram
            </a>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </div>
  )
}

export function whatsappHrefFor(phone: string, message: string) {
  return buildWhatsAppLink(phone, message)
}
