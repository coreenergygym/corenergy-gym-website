import type { GymSettings } from '../types'

export default function Footer({ settings }: { settings: GymSettings | null }) {
  return (
    <footer id="contact" className="border-t border-line bg-panel py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl tracking-widest">
              CORE<span className="text-volt">NERGY</span>
            </h3>
            <p className="mt-3 max-w-xs text-sm text-steel">
              {settings?.about_text ||
                'Train with purpose. Modern equipment, real trainers, no gimmicks.'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-steel">
              {settings?.phone && <li>Phone: {settings.phone}</li>}
              {settings?.whatsapp_number && <li>WhatsApp: {settings.whatsapp_number}</li>}
              {settings?.email && <li>Email: {settings.email}</li>}
              {settings?.address && <li>{settings.address}</li>}
              {settings?.opening_hours && <li>{settings.opening_hours}</li>}
              {!settings?.phone && !settings?.address && (
                <li className="text-steel/70">Contact details coming soon — set these in Admin → Gym Settings.</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase text-white">Follow</h4>
            <a
              href={settings?.instagram_url || 'https://www.instagram.com/corenergy_thegym/'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-volt hover:text-voltLight"
            >
              @corenergy_thegym on Instagram
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-steel/70">
          © {new Date().getFullYear()} {settings?.gym_name || 'CoreNergy The Gym'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
