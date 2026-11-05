import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, Bike, CalendarDays,
  CalendarRange, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, CreditCard, Filter, Home,
  IndianRupee, LocateFixed, LogOut, MapPin, Menu, Minus, Plus, Search,
  ShieldCheck, SlidersHorizontal, Sparkles, Star, Ticket, Trophy, UserRound,
  UserRoundPlus, Users, Wallet, X, Zap, Mail, Phone, PhoneCall, Globe, LockKeyhole, Eye,
  CircleHelp, MapPinned, Medal, BellRing, Percent, Dumbbell, ClipboardList, Gamepad2, Mountain, Route, Images, Video, PersonStanding
} from 'lucide-react'
import { readDemo, writeDemo } from './services/demoStore'
import { backendRequest } from './services/backendClient'
import { demoPeople } from './data/demoPeople'
import { demoTournamentTemplates } from './data/demoTournaments'
import { fetchPublishedTurfs, mediaUrl } from './services/sharedContentApi'

const RATE_PER_HOUR = 800
const BOOKING_KEY = 'bookings'
const INVITE_KEY = 'playerInvites'
const SPORTS = ['All', 'Football', 'Cricket', 'Badminton', 'Running', 'Pickleball', 'Paintball', 'Boxing']
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

const cleanMapLocation = value => {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/exact address not confirmed|exact location needs confirmation|location to confirm/i.test(text)) return ''
  return text
    .replace(/^(reported at|reported around|listings point to)\s+/i, '')
    .replace(/;\s*(confirm before travel|confirm exact address|exact venue location needs confirmation).*$/i, '')
    .replace(/\s*[·|]\s*(confirm exact address|exact locality to confirm|location to confirm).*$/i, '')
    .trim()
}

const googleMapsDirectionsUrl = venue => {
  const address = cleanMapLocation(venue.address)
  const area = cleanMapLocation(venue.area).split(/[·|]/)[0].trim()
  const destinationParts = [venue.name, address]
  if (area && !String(address || '').toLowerCase().includes(area.toLowerCase())) destinationParts.push(area)
  destinationParts.push('Madurai', 'Tamil Nadu', 'India')
  const uniqueDestinationParts = destinationParts
    .filter(Boolean)
    .filter((part, index, all) => all.findIndex(item => item.toLowerCase() === part.toLowerCase()) === index)
  const destination = uniqueDestinationParts.join(', ')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving&utm_source=fieldfinder&utm_campaign=venue_directions`
}
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const dateISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const prettyDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const prettyTime = value => { const [hh, mm] = value.split(':').map(Number); return `${hh % 12 || 12}:${String(mm).padStart(2,'0')} ${hh >= 12 ? 'PM' : 'AM'}` }
const addDays = (date, count) => { const d = new Date(date); d.setDate(d.getDate() + count); return d }
const seedDateSlots = (venueId, date) => {
  // Deterministic demo occupancy. This is intentionally labelled as sample inventory.
  const seed = [...`${venueId}-${date}`].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const times = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2,'0')}:00`)
  return times.map((time, i) => ({ time, sampleBooked: ((seed + i * 7) % 11) === 2 || ((seed + i * 13) % 17) === 3 }))
}
const startOfWeek = date => { const d = new Date(date); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0,0,0,0); return d }
const tournamentEvents = () => {
  const monday = startOfWeek(new Date())
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const nextMonday = addDays(monday, 7)
  return demoTournamentTemplates.map(item => {
    let date = addDays(monday, item.dayOffset)
    if (date < today) date = addDays(date, 7)
    return { ...item, date: dateISO(date), week: date < nextMonday ? 'This week' : 'Next week' }
  })
}

const buildAdventureEvents = () => [
  {
    id: 'madurai-randonneurs-400-brm-2026', kind: 'Cycling', title: 'Madurai Randonneurs · Artham 400 BRM',
    image: '/assets/events/audax-artham-400.webp',
    organiser: 'Madurai Randonneurs · Audax India Randonneurs',
    location: 'Flying Wheels – The Cyclist Hub · Madurai',
    date: '2026-11-14', dateLabel: 'Saturday, 14 November 2026', startTime: 'Flag-off · 4:00 PM',
    duration: '400 km · ACP-sanctioned brevet',
    description: 'A 400 km Brevet de Randonneurs Mondiaux ride listed by Audax India for Madurai Randonneurs. This is an endurance cycling event, not a casual city ride.',
    priceLabel: '₹1,500', priceNote: 'Event fee shown on the official Audax India page', fee: 1500,
    options: ['400 km brevet', 'Audax / ACP sanctioned', '18+ ride category'],
    eventNotes: [
      'Registration closes on 9 November 2026 at 11:55 PM.',
      'Flag-off is listed for 4:00 PM from Flying Wheels – The Cyclist Hub, Madurai.',
      'Ride name: ARTHAM 400. The official page links to the route map and publishes the current event fee as ₹1,500.',
      'Read the Audax India and ACP rules and route instructions before registering. This is a long-distance endurance ride and requires appropriate preparation.'
    ],
    registrationNote: 'Registration is handled by Audax India. FieldFinder does not collect the entry fee or confirm a rider entry.',
    officialUrl: 'https://www.audaxindia.in/event-e-10514',
    registrationUrl: 'https://www.audaxindia.in/event-e-10514',
    actionLabel: 'Open official registration', sourceLabel: 'Audax India Randonneurs · event page'
  },
  {
    id: 'madurai-randonneurs-600-brm-2026', kind: 'Cycling', title: 'Madurai Randonneurs · ALAI 600 BRM',
    image: '/assets/events/audax-alai-600.webp',
    organiser: 'Madurai Randonneurs · Audax India Randonneurs',
    location: 'Flying Wheels – The Cyclist Hub · Madurai',
    date: '2026-12-04', dateLabel: 'Friday, 4 December 2026', startTime: 'Flag-off · 4:00 PM',
    duration: '600 km · ACP-sanctioned brevet',
    description: 'A 600 km Audax India brevet starting in Madurai. The official event page identifies the ride as ALAI 600.',
    priceLabel: '₹1,750', priceNote: 'Displayed event fee; official page shows ₹2,000 as the earlier price', fee: 1750,
    options: ['600 km brevet', 'Audax / ACP sanctioned', 'Long-distance endurance ride'],
    eventNotes: [
      'Registration closes on 30 November 2026 at 11:55 PM.',
      'An early-bird offer is listed until 15 November 2026 at 11:55 PM for the first 25 registrations; check the organiser page for eligibility and current price.',
      'Flag-off is listed for 4:00 PM from Flying Wheels – The Cyclist Hub, Madurai.',
      'Ride name: ALAI 600. Follow the official route map, ACP rules and Audax India rules.'
    ],
    registrationNote: 'The official page lists registration through Audax India. Availability and the amount charged at checkout may change.',
    officialUrl: 'https://www.audaxindia.in/event-e-10515',
    registrationUrl: 'https://www.audaxindia.in/event-e-10515',
    actionLabel: 'Open official registration', sourceLabel: 'Audax India Randonneurs · event page'
  },
  {
    id: 'madurai-randonneurs-1000-brm-2026', kind: 'Cycling', title: 'Madurai Randonneurs · Enchanting South V2 1000 BRM',
    image: '/assets/events/audax-enchanting-south-1000.webp',
    organiser: 'Madurai Randonneurs · Audax India Randonneurs',
    location: 'Flying Wheels – The Cyclist Hub · Madurai',
    date: '2026-12-17', dateLabel: 'Thursday, 17 December 2026', startTime: 'Flag-off · 6:00 AM',
    duration: '1,000 km · ACP-sanctioned brevet',
    description: 'A 1,000 km Audax India brevet from Madurai, listed under the route name Enchanting South V2. Intended for experienced endurance riders.',
    priceLabel: '₹3,500', priceNote: 'Displayed event fee; official page shows ₹4,000 as the earlier price', fee: 3500,
    options: ['1,000 km brevet', 'Audax / ACP sanctioned', 'Experienced endurance riders'],
    eventNotes: [
      'Registration closes on 14 December 2026 at 11:55 PM.',
      'Flag-off is listed for 6:00 AM from Flying Wheels – The Cyclist Hub, Madurai.',
      'Ride name: Enchanting South V2. The official page currently displays ₹3,500 as the event fee.',
      'Review the route instructions and the Audax India / ACP rules carefully before entry. Plan for a multi-day endurance ride.'
    ],
    registrationNote: 'Registration and payment are handled on the official Audax India page. Confirm the final fee and entry availability before payment.',
    officialUrl: 'https://www.audaxindia.in/event-e-10817',
    registrationUrl: 'https://www.audaxindia.in/event-e-10817',
    actionLabel: 'Open official registration', sourceLabel: 'Audax India Randonneurs · event page'
  },
  {
    id: 'trek-kutladampatti-thadagai-madurai', kind: 'Trekking', title: 'Kutladampatti Falls · Thadagai Trail',
    image: '/assets/events/kutladampatti-waterfall.webp',
    organiser: 'Trek Tamil Nadu · Tamil Nadu Forest Department / TNWEC',
    location: 'Kutladampatti · Madurai district (around 30 km from Madurai)',
    date: null, dateLabel: 'Choose an available date on the official booking page',
    startTime: 'Select the available slot on the official portal', duration: 'Day trek · 8 km round trip · around 4 hours', difficulty: 'Moderate',
    description: 'A guided forest trek near Madurai through dry and moist deciduous woodland, streams and the Kutladampatti waterfall area.',
    priceLabel: '₹1,299 + 5% GST', priceNote: 'Official listed price for the moderate 8 km trail · per person', fee: 1299,
    options: ['Moderate', '8 km · 4 hours', 'Two-way route · 4 km out + 4 km back', 'Waterfall & forest trail'],
    highlights: [
      'Indicative trail flow from the published route: start at the Thadagai reception point, follow the forest path and stream sections, reach the Kutladampatti Falls area and viewpoints, then return by the same route.',
      'The official route page lists an 8 km two-way trail, moderate difficulty and a duration of about four hours.',
      'An easy 4 km / 2 hour variant is also listed in the official trail catalogue; confirm the selected variant and its current price on the booking page.'
    ],
    eventNotes: [
      'This is a one-day trail; the public listing does not publish a fixed departure date. Select a live date and slot on the official booking page.',
      'The official listing describes stream crossings, forest views, the waterfall area and wildlife habitat. The route flow above is indicative, not a timed programme.'
    ],
    inclusions: ['Trek permit fee', 'Guide service', 'Trek insurance within the route', 'Complimentary cap and birds pamphlet', 'Light refreshments / snacks'],
    exclusions: ['Transport to the reception point', 'Anything not listed in the official inclusions'],
    whatToCarry: ['Small daypack', 'Hiking boots or trail shoes', 'Reusable water bottle', 'Quick-dry clothing', 'Personal medication and ID', 'Sun / rain protection'],
    officialUrl: 'https://trektamilnadu.com/trail/thadagai-trail-kutladampatti-falls-sotharu',
    registrationUrl: 'https://trektamilnadu.com/trail/thadagai-trail-kutladampatti-falls-sotharu',
    actionLabel: 'Check dates & book officially', sourceLabel: 'Trek Tamil Nadu · official trail page'
  },
  {
    id: 'trek-kodaikanal-gundar-zero-point', kind: 'Trekking', title: 'Kodaikanal Observatory · Gundar Zero Point',
    image: '/assets/events/kodaikanal-observatory-trail.webp',
    organiser: 'Trek Tamil Nadu · Tamil Nadu Forest Department / TNWEC',
    location: 'Kodaikanal · Dindigul district (Madurai airport approx. 125 km)',
    date: null, dateLabel: 'Choose an available date on the official booking page',
    startTime: 'Select the available slot on the official portal', duration: 'Day trek · 10 km round trip · around 4 hours', difficulty: 'Easy',
    description: 'An easy Shola-forest birding trail in the Kodaikanal hills, ending at the waterfall area around Gundar Zero Point.',
    priceLabel: '₹999 + 5% GST', priceNote: 'Official listed price per person · insurance included', fee: 999,
    options: ['Easy', '10 km · 4 hours', 'Two-way route · 5 km each way', 'Birdwatching & waterfall'],
    highlights: [
      'Start from the forest check post and walk through Shola vegetation.',
      'Look for flycatchers, robins and butterflies along the route.',
      'Reach the waterfall at Zero Point before returning along the two-way trail.'
    ],
    eventNotes: ['The official listing shows a four-hour trail. It is a one-day trek; choose an available date and time on the official booking page.'],
    inclusions: ['Trek permit fee', 'Guide service', 'Trek insurance within the route', 'Complimentary cap and birds pamphlet', 'Light refreshments / snacks'],
    exclusions: ['Transport to the reception point', 'Anything not listed in the official inclusions'],
    whatToCarry: ['Daypack', 'Trail shoes', 'Water bottle', 'Warm layer', 'Personal medication and ID', 'Rain protection'],
    officialUrl: 'https://www.trektamilnadu.com/trail/solar-observatory-gundar-zero-point',
    registrationUrl: 'https://www.trektamilnadu.com/trail/solar-observatory-gundar-zero-point',
    actionLabel: 'Check dates & book officially', sourceLabel: 'Trek Tamil Nadu · official trail page'
  },
  {
    id: 'trek-kodaikanal-vellagavi', kind: 'Trekking', title: 'Kodaikanal · Vellagavi Camp Stay',
    image: '/assets/events/vellagavi-camp-stay.webp',
    organiser: 'Trek Tamil Nadu · Tamil Nadu Forest Department / TNWEC',
    location: 'Vattakanal – Vellagavi · Dindigul district (Madurai airport approx. 140 km)',
    date: null, dateLabel: 'Choose an available date on the official booking page',
    startTime: 'Select the available slot on the official portal', duration: '10 km round trip · around 10 hours · camp-stay option', difficulty: 'Moderate',
    description: 'A guided trail from Vattakanal to the remote forest village of Vellagavi, with a camp-stay option listed by the official portal.',
    priceLabel: '₹2,999 + 5% GST', priceNote: 'Official listed price per person · insurance included', fee: 2999,
    options: ['Moderate', '10 km · 10 hours', 'Two-way route · 5 km each way', 'Tented accommodation option'],
    highlights: [
      'The route descends from Vattakanal to the forest village of Vellagavi, through mountain scenery and a South Indian sub-tropical hill-savana landscape.',
      'The official page lists 10 km, two-way (5 km each way), moderate difficulty and a 10-hour duration.',
      'The booking page shows camp-stay accommodation choices. Confirm the number of nights and the exact itinerary with the operator before paying.'
    ],
    inclusions: ['Trek permit fee', 'Guide service', 'Trek insurance within the route', 'Complimentary cap and birds pamphlet', 'Tented accommodation', 'Light refreshments / snacks'],
    exclusions: ['Transport to the reception point', 'Anything not listed in the official inclusions'],
    whatToCarry: ['Daypack', 'Trekking shoes with grip', 'Water bottle', 'Quick-dry clothing and warm layer', 'Personal medication and ID', 'Rain protection'],
    officialUrl: 'https://www.trektamilnadu.com/trail/vattakanal-vellagavi',
    registrationUrl: 'https://www.trektamilnadu.com/trail/vattakanal-vellagavi',
    actionLabel: 'Check camp packages & dates', sourceLabel: 'Trek Tamil Nadu · official trail page'
  },
  {
    id: 'trek-kumbakarai-vellagavi-kodai', kind: 'Trekking', title: 'Kumbakarai · Vellagavi · Kodaikanal Camp Trek',
    image: '/assets/events/kumbakarai-western-ghats.webp',
    organiser: 'Trek Tamil Nadu · Tamil Nadu Forest Department / TNWEC',
    location: 'Kumbakarai Falls · Dindigul district (Madurai airport approx. 105 km)',
    date: null, dateLabel: 'Choose an available date on the official booking page',
    startTime: 'Select the available slot on the official portal', duration: '14 km one-way · around 12 hours · camp-stay', difficulty: 'Tough',
    description: 'A demanding Western Ghats traverse from Kumbakarai Falls through Vellagavi towards Kodaikanal, with forest, coffee-plantation and village scenery.',
    priceLabel: '₹2,999 + 5% GST', priceNote: 'Official listed price per person · insurance included', fee: 2999,
    options: ['Tough', '14 km one-way', 'Around 12 hours listed', 'Tented camp stay'],
    highlights: [
      'The official route describes steep ascents and rocky paths from Kumbakarai Falls through Vellagavi towards Kodaikanal.',
      'Published highlights include forest and coffee-plantation scenery, mountain-village life, birds and views around Dolphin’s Nose.',
      'The organiser page lists a 12-hour trail, tented accommodation and three meals. Recent participant reviews describe some itineraries as two days with an overnight camp; confirm the exact day-by-day schedule and pickup plan with the operator.'
    ],
    inclusions: ['Trek permit fee', 'Guide service', 'Trek insurance within the route', 'Complimentary cap and birds pamphlet', 'Tented accommodation', 'Three meals / refreshments'],
    exclusions: ['Transport to the reception point', 'Anything not listed in the official inclusions'],
    whatToCarry: ['Daypack', 'Trekking boots with strong grip', 'Reusable water bottle', 'Quick-dry clothing and warm layer', 'Personal medication and ID', 'Rain jacket and leech socks'],
    officialUrl: 'https://www.trektamilnadu.com/trail/kumbakarai-vellagavi-kodaikanal-1-1',
    registrationUrl: 'https://www.trektamilnadu.com/trail/kumbakarai-vellagavi-kodaikanal-1-1',
    actionLabel: 'Check camp packages & dates', sourceLabel: 'Trek Tamil Nadu · official trail page'
  },
  {
    id: 'trek-kurangani-sambalaru', kind: 'Trekking', title: 'Kurangani · Sambalaru Trail',
    image: '/assets/events/kurangani-sambalaru.webp',
    organiser: 'Trek Tamil Nadu · Tamil Nadu Forest Department / TNWEC',
    location: 'Kurangani · Theni district (Madurai airport approx. 122 km)',
    date: null, dateLabel: 'Choose an available date on the official booking page',
    startTime: 'Select the available slot on the official portal', duration: 'Day trek · 5 km round trip · around 3 hours', difficulty: 'Easy',
    description: 'A short guided trail through wild pastures and semi-evergreen forest, with waterfalls, river scenery and a watchtower viewpoint in the Kurangani hills.',
    priceLabel: '₹699 + 5% GST', priceNote: 'Official listed price per person · insurance included', fee: 699,
    options: ['Easy', '5 km · 3 hours', 'Two-way route · 2.5 km each way', 'Waterfalls & watchtower'],
    highlights: [
      'The official route overview describes wild pastures, Shola patches, waterfalls and views towards Kolukkumalai and nearby peaks.',
      'Nearby attractions listed by the operator include Sambalaru Falls, Kottakudi River, the Kottakudi check dam, mini falls and hidden falls.',
      'This is listed as an easy, three-hour, two-way trail.'
    ],
    inclusions: ['Trek permit fee', 'Guide service', 'Trek insurance within the route', 'Complimentary cap and birds pamphlet', 'Light refreshments / snacks'],
    exclusions: ['Transport to the reception point', 'Anything not listed in the official inclusions'],
    whatToCarry: ['Daypack', 'Trail shoes', 'Reusable water bottle', 'Quick-dry clothing', 'Personal medication and ID', 'Sun / rain protection'],
    officialUrl: 'https://trektamilnadu.com/public/trail/kurangani-sambalaru',
    registrationUrl: 'https://trektamilnadu.com/public/trail/kurangani-sambalaru',
    actionLabel: 'Check dates & book officially', sourceLabel: 'Trek Tamil Nadu · official trail page'
  }
]

const mergePublishedVenues = (directory, published) => {
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const merged = [...directory]
  for (const item of published || []) {
    const index = merged.findIndex(venue => normalize(venue.name) === normalize(item.name))
    const images = (item.media || []).filter(media => media.type === 'IMAGE')
    const patch = {
      id: index >= 0 ? merged[index].id : `owner-turf-${item.id}`,
      ownerTurfId: item.id, name: item.name, area: item.area || 'Madurai',
      address: item.address || item.area || 'Address to be confirmed',
      sports: item.sports?.length ? item.sports : (index >= 0 ? merged[index].sports : []),
      hourlyRate: item.hourlyRate || 800, media: item.media || [], ownerPublished: true,
      photoUrl: images.length ? mediaUrl(images[0].url) : (index >= 0 ? merged[index].photoUrl : '/assets/venue-illustrations/multisport.svg'),
      photoKind: images.length ? 'owner-upload' : (index >= 0 ? merged[index].photoKind : 'owner-listing'),
      summary: index >= 0 ? `${merged[index].summary || 'Venue listing'} Owner-updated games and media may be available.` : 'Owner-published venue listing with games and media.'
    }
    if (index >= 0) merged[index] = { ...merged[index], ...patch }
    else merged.push(patch)
  }
  return merged
}

function App() {
  const [venues, setVenues] = useState([])
  const [user, setUser] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const pendingAuthAction = useRef(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [page, setPage] = useState('discover')
  const [mobileNav, setMobileNav] = useState(false)
  const [sportsMenuOpen, setSportsMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('All')
  const [area, setArea] = useState('All areas')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [bookingDate, setBookingDate] = useState(todayISO())
  const [duration, setDuration] = useState(1)
  const [selectedTime, setSelectedTime] = useState('')
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI demo')
  const [bookings, setBookings] = useState(() => readDemo(BOOKING_KEY, []))
  const [bookingFilter, setBookingFilter] = useState('All')
  const [toast, setToast] = useState('')
  const [playerVenueId, setPlayerVenueId] = useState('')
  const [playerSport, setPlayerSport] = useState('All')
  const [playerSearch, setPlayerSearch] = useState('')
  const [invites, setInvites] = useState(() => readDemo(INVITE_KEY, []))
  const [tournamentSport, setTournamentSport] = useState('All')
  const [tournamentRegistrations, setTournamentRegistrations] = useState(() => readDemo('tournamentRegistrations', []))
  const [adventureRegistrations, setAdventureRegistrations] = useState(() => readDemo('adventureRegistrations', []))
  const [publishedTurfs, setPublishedTurfs] = useState([])
  const [announcementTarget, setAnnouncementTarget] = useState(null)
  const baseVenuesRef = useRef([])
  const publishedTurfsRef = useRef([])
  const adventureEvents = useMemo(() => buildAdventureEvents(), [])

  // Browsing is public. Restore a server-authenticated customer only when a valid
  // HttpOnly FieldFinder session cookie already exists.
  useEffect(() => {
    let active = true
    backendRequest('/api/auth/me')
      .then(account => {
        if (!active) return
        if (account?.role === 'CUSTOMER') setUser(account)
      })
      .catch(() => { /* Guest browsing stays available when no session exists. */ })
      .finally(() => { if (active) setAuthChecking(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/venues.json').then(r => { if (!r.ok) throw new Error('Venue list unavailable'); return r.json() })
      .then(directory => {
        if (!active) return
        baseVenuesRef.current = directory || []
        setVenues(mergePublishedVenues(baseVenuesRef.current, publishedTurfsRef.current))
      })
      .catch(() => { if (active) { baseVenuesRef.current = []; setVenues(mergePublishedVenues([], publishedTurfsRef.current)) } })
    return () => { active = false }
  }, [])
  useEffect(() => {
    let active = true
    const refresh = () => fetchPublishedTurfs().then(items => {
      if (!active) return
      publishedTurfsRef.current = items || []
      setPublishedTurfs(items || [])
      setVenues(mergePublishedVenues(baseVenuesRef.current, items || []))
    }).catch(() => { /* backend is optional while running in local demo mode */ })
    refresh()
    const timer = window.setInterval(refresh, 15000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [])
  useEffect(() => writeDemo(BOOKING_KEY, bookings), [bookings])
  useEffect(() => writeDemo(INVITE_KEY, invites), [invites])
  useEffect(() => writeDemo('tournamentRegistrations', tournamentRegistrations), [tournamentRegistrations])
  useEffect(() => writeDemo('adventureRegistrations', adventureRegistrations), [adventureRegistrations])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer) }, [toast])
  useEffect(() => {
    const shell = document.querySelector('.experiment-shell')
    if (!shell) return undefined
    const progress = shell.querySelector('.experiment-scroll-progress')
    const parallaxItems = Array.from(shell.querySelectorAll('[data-scroll-parallax]'))
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
      if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / maxScroll))})`
      if (reduceMotion || !parallaxItems.length) return
      const height = window.innerHeight || 1
      parallaxItems.forEach(node => {
        const rect = node.getBoundingClientRect()
        if (rect.bottom < -80 || rect.top > height + 80) return
        const midpoint = rect.top + rect.height / 2
        const shift = Math.max(-22, Math.min(22, (height / 2 - midpoint) * 0.035))
        node.style.setProperty('--scroll-shift', `${shift.toFixed(1)}px`)
      })
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [page])
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.experiment-shell [data-exp-reveal]'))
    if (!nodes.length) return undefined
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('exp-revealed'))
      return undefined
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Toggle in both directions so the reveal replays whenever the section
        // leaves and later re-enters the viewport (scrolling down or up).
        entry.target.classList.toggle('exp-revealed', entry.isIntersecting)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [page, venues.length])

  const areas = useMemo(() => ['All areas', ...Array.from(new Set(venues.map(v => (v.area || '').split('·')[0].trim()).filter(Boolean))).sort()], [venues])
  const filteredVenues = useMemo(() => venues.filter(v => {
    const haystack = `${v.name} ${v.area} ${v.address} ${(v.sports || []).join(' ')}`.toLowerCase()
    const matchesSearch = haystack.includes(search.toLowerCase())
    const matchesSport = sport === 'All' || (v.sports || []).some(s => s.toLowerCase() === sport.toLowerCase())
    const matchesArea = area === 'All areas' || (v.area || '').toLowerCase().includes(area.toLowerCase())
    return matchesSearch && matchesSport && matchesArea
  }), [venues, search, sport, area])
  const customerBookings = useMemo(() => bookings.filter(b => b.customerId === user?.id).sort((a,b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)), [bookings, user])
  const filteredBookings = customerBookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter)
  const tournaments = useMemo(() => tournamentEvents().filter(e => tournamentSport === 'All' || e.sport === tournamentSport), [tournamentSport])
  const myInviteIds = new Set(invites.filter(i => i.customerId === user?.id).map(i => i.playerId))

  function notify(message) { setToast(message) }
  function updateAuth(key, value) { setAuthForm(prev => ({ ...prev, [key]: value })) }
  async function submitAuth(event) {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    try {
      let account
      if (authMode === 'register') {
        const username = authForm.username.trim()
        const email = authForm.email.trim().toLowerCase()
        if (username.length < 3) { setAuthError('Username must contain at least 3 characters.'); return }
        if (!email) { setAuthError('Enter an email address.'); return }
        if (authForm.password.length < 8) { setAuthError('Use a password with at least 8 characters.'); return }
        const result = await backendRequest('/api/auth/register/customer', {
          method: 'POST',
          body: JSON.stringify({ username, email, password: authForm.password })
        })
        account = result?.user
      } else {
        if (!authForm.username.trim() || !authForm.password) {
          setAuthError('Enter your username and password.')
          return
        }
        const result = await backendRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: authForm.username.trim(), password: authForm.password, role: 'customer' })
        })
        account = result?.user
      }
      if (!account || account.role !== 'CUSTOMER') throw new Error('A valid customer account was not returned by FieldFinder.')
      setUser(account)
      setAuthModalOpen(false)
      setAuthForm({ username: '', email: '', password: '' })
      setAuthNotice('')
      notify(authMode === 'register' ? 'Customer account created successfully.' : `Welcome back, ${account.name || account.username}!`)
      const continueAction = pendingAuthAction.current
      pendingAuthAction.current = null
      if (continueAction) continueAction(account)
    } catch (error) {
      setAuthError(error.message || 'Unable to complete authentication. Check that the FieldFinder backend is running.')
    }
  }

  function openCustomerAuth(action = null, message = 'Sign in or create a customer account to continue with booking.') {
    if (user) {
      if (action) action(user)
      return
    }
    pendingAuthAction.current = action
    setAuthError('')
    setAuthNotice(message)
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  async function logout() {
    try { await backendRequest('/api/auth/logout', { method: 'POST' }) }
    catch { /* Clear the local view even if the backend session has expired. */ }
    setUser(null)
    setPage('discover')
    setAuthModalOpen(false)
    pendingAuthAction.current = null
    notify('You have been signed out.')
  }
  function openVenue(venue) { setSelectedVenue(venue); setBookingDate(todayISO()); setDuration(1); setSelectedTime(''); setCoupon(''); setAppliedCoupon(null); setCouponError(''); setCheckout(false) }
  function getPrice() {
    const subtotal = duration * RATE_PER_HOUR
    let discountPercent = 0
    if (appliedCoupon === 'PLAY10' && duration >= 2) discountPercent = 10
    if (appliedCoupon === 'TEAM15' && duration >= 3) discountPercent = 15
    if (appliedCoupon === 'WEEKDAY5') {
      const day = new Date(`${bookingDate}T00:00:00`).getDay()
      if (day !== 0 && day !== 6) discountPercent = 5
    }
    const discount = Math.round(subtotal * discountPercent / 100)
    return { subtotal, discount, total: subtotal - discount, discountPercent }
  }
  function applyCoupon() {
    const code = coupon.trim().toUpperCase()
    if (!['PLAY10','TEAM15','WEEKDAY5'].includes(code)) { setAppliedCoupon(null); setCouponError('Invalid demo coupon. Try PLAY10, TEAM15 or WEEKDAY5.'); return }
    if (code === 'PLAY10' && duration < 2) { setAppliedCoupon(null); setCouponError('PLAY10 applies to bookings of 2 hours or more.'); return }
    if (code === 'TEAM15' && duration < 3) { setAppliedCoupon(null); setCouponError('TEAM15 applies to bookings of 3 hours or more.'); return }
    if (code === 'WEEKDAY5') {
      const day = new Date(`${bookingDate}T00:00:00`).getDay()
      if (day === 0 || day === 6) { setAppliedCoupon(null); setCouponError('WEEKDAY5 applies to Monday–Friday bookings.'); return }
    }
    setAppliedCoupon(code); setCouponError(''); notify(`${code} discount applied.`)
  }
  const bookedForVenueDate = (venueId, date) => bookings.filter(b => b.venueId === venueId && b.date === date && b.status !== 'Cancelled').map(b => ({ time: b.time, duration: b.duration }))
  function slotOptions(venue, date, hours) {
    const base = seedDateSlots(venue.id, date)
    const bookingsForDate = bookedForVenueDate(venue.id, date)
    const starts = base.filter(slot => {
      const startHour = Number(slot.time.slice(0,2))
      const range = Array.from({ length: hours }, (_,i) => `${String(startHour+i).padStart(2,'0')}:00`)
      const hasSampleConflict = range.some(t => base.find(s => s.time === t)?.sampleBooked)
      const overlaps = bookingsForDate.some(b => {
        const bStart = Number(b.time.slice(0,2)); const bEnd = bStart + b.duration
        return range.some(t => { const h = Number(t.slice(0,2)); return h >= bStart && h < bEnd })
      })
      return startHour + hours <= 22 && !hasSampleConflict && !overlaps
    })
    return base.map(slot => ({ ...slot, available: starts.some(s => s.time === slot.time) }))
  }
  function startBooking() {
    if (!selectedVenue || !selectedTime) { notify('Choose an available start time first.'); return }
    openCustomerAuth(() => setCheckout(true), 'Create an account or sign in to continue to booking checkout.')
  }
  function completeBooking() {
    if (!user || !selectedVenue || !selectedTime) return
    const price = getPrice()
    const booking = {
      id: `FF-${String(Date.now()).slice(-7)}`, customerId: user.id, customerName: user.name,
      venueId: selectedVenue.id, venueName: selectedVenue.name, area: selectedVenue.area,
      sport: (selectedVenue.sports || ['Football'])[0], date: bookingDate, time: selectedTime,
      duration, ratePerHour: RATE_PER_HOUR, subtotal: price.subtotal, discountCode: appliedCoupon || '',
      discount: price.discount, total: price.total, paymentMethod,
      paymentStatus: paymentMethod === 'Pay at venue (demo)' ? 'Pending' : 'Demo payment complete',
      status: 'Awaiting owner confirmation', createdAt: new Date().toISOString()
    }
    setBookings(prev => [booking, ...prev])
    setCheckout(false); setSelectedVenue(null); setSelectedTime(''); setPage('bookings')
    notify('Demo booking request created. No real payment was collected.')
  }
  function cancelBooking(id) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled', paymentStatus: b.paymentStatus === 'Demo payment complete' ? 'Demo refund not processed' : b.paymentStatus } : b))
    notify('Booking cancelled in this demo. No live venue was notified.')
  }
  function sendInvite(player) {
    if (myInviteIds.has(player.id)) return
    openCustomerAuth(authenticatedUser => {
      setInvites(prev => [...prev, { id: `invite-${Date.now()}`, playerId: player.id, playerName: player.name, venueId: playerVenueId, customerId: authenticatedUser.id, createdAt: new Date().toISOString(), status: 'Invite sent (demo)' }])
      notify(`Demo invite sent to ${player.name}.`)
    }, 'Sign in or create a customer account before sending a game invite.')
  }
  function registerTournament(event, details) {
    if (tournamentRegistrations.some(r => r.eventId === event.id && r.customerId === user.id)) return
    const registration = {
      id: `FF-TR-${String(Date.now()).slice(-8)}`, eventId: event.id, eventTitle: event.title,
      sport: event.sport, date: event.date, time: event.time, fee: event.fee,
      customerId: user.id, customerName: user.name, teamName: details.teamName.trim(),
      captain: { name: details.captainName.trim(), phone: details.captainPhone.trim(), email: details.captainEmail.trim() },
      players: details.players.filter(player => player.name.trim()).map(player => ({ name: player.name.trim(), phone: player.phone.trim() })),
      substitutes: details.substitutes.filter(player => player.name.trim()).map(player => ({ name: player.name.trim(), phone: player.phone.trim() })),
      status: 'Registration submitted (demo)', createdAt: new Date().toISOString()
    }
    setTournamentRegistrations(prev => [registration, ...prev])
    notify(`Team ${registration.teamName} registered for ${event.title} (demo).`)
  }

  function registerAdventure(event, details) {
    const registration = {
      id: `FF-EV-${String(Date.now()).slice(-8)}`, eventId: event.id, eventTitle: event.title,
      kind: event.kind, date: event.date, customerId: user.id, customerName: user.name,
      fee: details.packageFee || event.fee, totalAmount: details.totalAmount || event.fee, ...details, status: event.kind === 'Marathon' ? 'Registration saved (demo)' : 'Trek booking request saved (demo)',
      createdAt: new Date().toISOString()
    }
    setAdventureRegistrations(previous => [registration, ...previous])
    notify(`${event.kind} ${event.kind === 'Marathon' ? 'registration' : 'booking'} saved for ${event.title} (demo).`)
  }

  function navigateFromAnnouncement(item) {
    if (item.page === 'discover' && item.sport) setSport(item.sport)
    if (item.page === 'tournaments') setTournamentSport('All')
    setAnnouncementTarget({ ...item, nonce: Date.now() })
    setPage(item.page)
    setMobileNav(false)
    if (item.page === 'discover' && item.sport) {
      window.setTimeout(() => document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 90)
    }
  }

  const nav = [
    { id: 'discover', label: 'Discover venues', icon: Search },
    { id: 'bookings', label: 'My bookings', icon: CalendarDays },
    { id: 'players', label: 'Find players', icon: Users },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'events', label: 'Events & adventures', icon: Route },
    { id: 'profile', label: 'My profile', icon: UserRound }
  ]

  function navigatePage(id) {
    const go = () => {
      setPage(id)
      setMobileNav(false)
      setSportsMenuOpen(false)
      setAnnouncementTarget(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (id === 'bookings' || id === 'profile') {
      openCustomerAuth(go, 'Sign in or create a customer account to view your personal FieldFinder activity.')
    } else go()
  }
  function chooseExperimentSport(item) {
    setSport(item)
    setArea('All areas')
    setPage('discover')
    setSportsMenuOpen(false)
    setMobileNav(false)
    window.setTimeout(() => document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  return <div className="customer-shell experiment-shell">
    <div className="experiment-scroll-progress" aria-hidden="true"/>
    <header className="experiment-topbar">
      <button className="experiment-brand" type="button" onClick={() => navigatePage('discover')} aria-label="FieldFinder home">
        <span className="brand-mark"><Trophy size={22}/></span>
        <span className="experiment-brand-copy">fieldfinder<span className="brand-dot">.</span><small>PLAY MORE. PLAN LESS.</small></span>
      </button>
      <nav className="experiment-nav" aria-label="Main navigation">
        <button className={`experiment-nav-link ${page === 'discover' ? 'active' : ''}`} onClick={() => navigatePage('discover')}>Discover</button>
        <div className={`experiment-sports-nav ${sportsMenuOpen ? 'open' : ''}`}>
          <button className="experiment-nav-link" type="button" aria-expanded={sportsMenuOpen} onClick={() => setSportsMenuOpen(value => !value)}>Sports <ChevronDown size={15}/></button>
          {sportsMenuOpen && <div className="experiment-mega-menu">
            <div className="experiment-mega-intro"><span className="section-kicker">FIND YOUR KIND OF PLAY</span><strong>Pick a sport.<br/>Find your place.</strong><p>Explore local facilities across Madurai.</p></div>
            <div className="experiment-mega-options">{SPORTS.slice(1).map(item => <button key={item} type="button" onClick={() => chooseExperimentSport(item)}><span>{item}</span><small>{venues.filter(v => (v.sports || []).some(value => value.toLowerCase() === item.toLowerCase())).length} listings</small><ArrowUpRight size={15}/></button>)}</div>
          </div>}
        </div>
        <button className={`experiment-nav-link ${page === 'events' ? 'active' : ''}`} onClick={() => navigatePage('events')}>Events & adventures</button>
        <button className={`experiment-nav-link ${page === 'tournaments' ? 'active' : ''}`} onClick={() => navigatePage('tournaments')}>Tournaments</button>
        <button className={`experiment-nav-link ${page === 'players' ? 'active' : ''}`} onClick={() => navigatePage('players')}>Find players</button>
      </nav>
      <div className="experiment-top-actions">
        <button className="experiment-search-shortcut" type="button" onClick={() => { if (page !== 'discover') navigatePage('discover'); window.setTimeout(() => document.getElementById('venue-search')?.focus(), 80) }}><Search size={16}/><span>Search venues</span><kbd>/</kbd></button>
        {user ? <div className="dropdown customer-account-dropdown experiment-account"><button className="profile-mini dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span className="avatar">{(user.name || user.username || 'C').slice(0,1).toUpperCase()}</span><strong>{user.name || user.username}</strong></button><ul className="dropdown-menu dropdown-menu-end"><li><button className="dropdown-item" type="button" onClick={() => navigatePage('profile')}>My profile</button></li><li><button className="dropdown-item" type="button" onClick={() => navigatePage('bookings')}>My bookings</button></li><li><hr className="dropdown-divider"/></li><li><button className="dropdown-item text-danger" type="button" onClick={logout}>Sign out</button></li></ul></div> : <><span className="guest-status">Browsing as guest</span><button className="guest-signin-btn" type="button" onClick={() => openCustomerAuth()}>Sign in</button></>}
        <button className="experiment-mobile-toggle" type="button" aria-label={mobileNav ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNav} onClick={() => setMobileNav(value => !value)}>{mobileNav ? <X size={21}/> : <Menu size={21}/>}</button>
      </div>
    </header>
    {mobileNav && <div className="experiment-mobile-panel">
      <div className="experiment-mobile-caption">EXPLORE FIELDFINDER</div>
      {[{id:'discover',label:'Discover'},{id:'events',label:'Events & adventures'},{id:'tournaments',label:'Tournaments'},{id:'players',label:'Find players'},{id:'bookings',label:'My bookings'},{id:'profile',label:'My profile'}].map(item => <button key={item.id} type="button" onClick={() => navigatePage(item.id)}>{item.label}<ArrowUpRight size={16}/></button>)}
      <div className="experiment-mobile-caption">SPORTS</div>
      <div className="experiment-mobile-sports">{SPORTS.slice(1).map(item => <button key={item} type="button" onClick={() => chooseExperimentSport(item)}>{item}</button>)}</div>
    </div>}
    <main className="experiment-main">
      {page !== 'discover' && <div className="experiment-breadcrumb"><button onClick={() => navigatePage('discover')}>FieldFinder</button><span>/</span><strong>{nav.find(n => n.id === page)?.label}</strong></div>}
      {page === 'discover' && <DiscoverPage venues={filteredVenues} total={venues.length} search={search} setSearch={setSearch} sport={sport} setSport={setSport} areas={areas} area={area} setArea={setArea} onOpen={openVenue} onGoPlayers={() => navigatePage('players')} adventureEvents={adventureEvents} onNavigateAnnouncement={navigateFromAnnouncement} onGoPage={navigatePage} />}
      {page === 'bookings' && user && <BookingsPage bookings={filteredBookings} filter={bookingFilter} setFilter={setBookingFilter} onCancel={cancelBooking} />}
      {page === 'players' && <PlayersPage venues={venues} selectedVenueId={playerVenueId} setSelectedVenueId={setPlayerVenueId} sport={playerSport} setSport={setPlayerSport} search={playerSearch} setSearch={setPlayerSearch} invited={myInviteIds} onInvite={sendInvite} />}
      {page === 'tournaments' && <TournamentsPage events={tournaments} sport={tournamentSport} setSport={setTournamentSport} registrations={tournamentRegistrations.filter(r => r.customerId === user?.id)} onRegister={registerTournament} onRequireAuth={openCustomerAuth} focusAnnouncement={announcementTarget?.page === 'tournaments' ? announcementTarget : null} />}
      {page === 'events' && <AdventureEventsPage events={adventureEvents} focusAnnouncement={announcementTarget?.page === 'events' ? announcementTarget : null} />}
      {page === 'profile' && user && <ProfilePage user={user} bookings={customerBookings} invites={invites.filter(i => i.customerId === user.id)} onLogout={logout} />}
    </main>
    <footer className="experiment-footer"><div className="experiment-footer-brand"><span className="brand-mark"><Trophy size={20}/></span><strong>fieldfinder<span>.</span></strong></div><p>Find your place to play. Meet your team. Make time for the game.</p><div className="experiment-footer-links"><button onClick={() => navigatePage('discover')}>Discover</button><button onClick={() => navigatePage('events')}>Events</button><button onClick={() => navigatePage('tournaments')}>Tournaments</button><button onClick={() => navigatePage('players')}>Find players</button></div><small>© 2026 FieldFinder · Madurai region</small></footer>
    {selectedVenue && <BookingModal venue={selectedVenue} onFindPlayers={() => { setPlayerVenueId(selectedVenue.id); setPlayerSport((selectedVenue.sports || ['All'])[0]); setSelectedVenue(null); navigatePage('players') }} date={bookingDate} setDate={value => { setBookingDate(value); setSelectedTime(''); setAppliedCoupon(null); setCouponError('') }} duration={duration} setDuration={value => { setDuration(value); setAppliedCoupon(null); setCouponError('') }} selectedTime={selectedTime} setSelectedTime={setSelectedTime} slots={slotOptions(selectedVenue, bookingDate, duration)} coupon={coupon} setCoupon={setCoupon} appliedCoupon={appliedCoupon} couponError={couponError} applyCoupon={applyCoupon} price={getPrice()} onClose={() => { setSelectedVenue(null); setCheckout(false) }} onContinue={startBooking} />}
    {checkout && selectedVenue && <CheckoutModal venue={selectedVenue} date={bookingDate} time={selectedTime} duration={duration} price={getPrice()} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onBack={() => setCheckout(false)} onConfirm={completeBooking} />}
    {authModalOpen && <CustomerAuthModal mode={authMode} setMode={mode => { setAuthMode(mode); setAuthError(''); setAuthNotice('') }} form={authForm} update={updateAuth} onSubmit={submitAuth} error={authError} notice={authNotice} onClose={() => { setAuthModalOpen(false); pendingAuthAction.current = null }} />}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    <div className="demo-ribbon"><ShieldCheck size={13}/> EXPERIMENTAL CUSTOMER EXPERIENCE · DEMO BOOKINGS & PAYMENTS · Owner-published media sync when the backend is running</div>
  </div>
}

function HomeAnnouncementMarquee({ adventureEvents, onNavigate }) {
  const events = adventureEvents.slice(0, 4)
  const games = [
    { id: 'new-pickleball', page: 'discover', sport: 'Pickleball', kind: 'NEW GAME', title: 'Pickleball', meta: 'Explore local courts', icon: Activity },
    { id: 'new-paintball', page: 'discover', sport: 'Paintball', kind: 'NEW GAME', title: 'Paintball arenas', meta: 'Find an action session', icon: Zap },
    { id: 'new-boxing', page: 'discover', sport: 'Boxing', kind: 'TRAIN & MOVE', title: 'Boxing & fitness', meta: 'Discover local academies', icon: Dumbbell }
  ]
  const cards = [
    ...events.map(item => ({ id: item.id, page: 'events', kind: item.kind.toUpperCase(), title: item.title, meta: `${item.dateLabel || 'Choose a date on the official portal'} · ${item.location}`, icon: item.kind === 'Cycling' ? Bike : item.kind === 'Trekking' ? Mountain : PersonStanding })),
    ...games
  ]
  const renderCards = (duplicate = false) => cards.map(item => {
    const Icon = item.icon
    return <button className={`experiment-news-card ${item.kind === 'NEW GAME' || item.kind === 'TRAIN & MOVE' ? 'game-news' : ''}`} type="button" key={`${duplicate ? 'copy-' : ''}${item.id}`} onClick={() => !duplicate && onNavigate(item)} tabIndex={duplicate ? -1 : 0}>
      <span className="experiment-news-icon"><Icon size={20}/></span>
      <span className="experiment-news-copy"><small>{item.kind}</small><strong>{item.title}</strong><em>{item.meta}</em></span>
      <ArrowUpRight className="experiment-news-arrow" size={18}/>
    </button>
  })
  return <section className="experiment-whats-on" data-exp-reveal aria-label="What's on in the Madurai region">
    <div className="experiment-section-heading"><div><span className="section-kicker">LOCAL PLAY · LOCAL ADVENTURES</span><h2>What’s happening around Madurai.</h2><p>Upcoming rides, outdoor experiences and new ways to play.</p></div><button className="experiment-text-link" type="button" onClick={() => onNavigate({ page: 'events' })}>View all events <ArrowUpRight size={16}/></button></div>
    <div className="experiment-news-marquee" aria-label="Moving event and activity cards">
      <div className="experiment-news-marquee-track">
        <div className="experiment-news-marquee-group">{renderCards(false)}</div>
        <div className="experiment-news-marquee-group" aria-hidden="true">{renderCards(true)}</div>
      </div>
    </div>
  </section>
}

function AdventureEventsPage({ events, focusAnnouncement }) {
  useEffect(() => {
    if (!focusAnnouncement?.id) return
    const timer = window.setTimeout(() => {
      const target = document.querySelector(`[data-event-id="${focusAnnouncement.id}"]`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.add('announcement-focus')
      }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [focusAnnouncement])

  return <>
    <PageHeader kicker="MADURAI REGION · EVENTS & OUTDOOR EXPERIENCES" title="Events & adventures" description="Verified sports events in Madurai, plus official guided trails in nearby Dindigul and Theni." />
    <div className="adventure-intro-strip"><Route size={18}/><span>Madurai region only · Information checked on 4 November 2026. No upcoming Madurai marathon with a verifiable open organiser listing was found; past August races are intentionally not shown. Cycling events below are listed by Audax India. Trek slots and payments are handled by Trek Tamil Nadu.</span></div>
    <div className="adventure-event-grid">{events.map(event => {
      const marathon = event.kind === 'Marathon'
      const isTrek = event.kind === 'Trekking'
      const isTournament = event.kind === 'Tournament'
      const isCycling = event.kind === 'Cycling'
      const categoryItems = event.categories || (event.options || []).map(name => ({ name }))
      return <article className={`adventure-event-card ${isTrek ? 'trekking' : isTournament ? 'tournament' : isCycling ? 'cycling' : 'marathon'}`} key={event.id} data-event-id={event.id}>
        <div className="adventure-card-art">
          <img className="adventure-card-photo" src={event.image} alt={`${event.title} activity`} loading="lazy" decoding="async" />
          <span className="adventure-card-art-icon">{isTournament ? <Trophy size={30}/> : isCycling ? <Bike size={30}/> : marathon ? <PersonStanding size={30}/> : <Mountain size={30}/>}</span>
          <b>{event.kind.toUpperCase()}</b>
        </div>
        <div className="adventure-card-body">
          <span className="section-kicker">{isCycling ? 'AUDAX INDIA · ACP-SANCTIONED BREVET' : marathon ? 'ROAD RUNNING · OFFICIAL EVENT' : isTournament ? 'CRICKET · OFFICIAL CHAMPIONSHIP' : 'GUIDED TRAIL · OFFICIAL PORTAL'}</span>
          <h2>{event.title}</h2><p>{event.description}</p>
          <div className="adventure-facts">
            <span><MapPin size={15}/>{event.location}</span>
            <span><CalendarDays size={15}/>{event.dateLabel || (event.date ? prettyDate(event.date) : 'Date to be selected')}</span>
            <span><Clock3 size={15}/>{event.startTime}</span>
            {event.duration && <span><CalendarRange size={15}/>{event.duration}</span>}
            {isTrek && <span><Activity size={15}/>Difficulty · {event.difficulty}</span>}
            {event.organiser && <span><Users size={15}/>Organiser · {event.organiser}</span>}
          </div>
          <div className="adventure-options"><strong>{isCycling ? 'Ride details' : marathon ? 'Race categories & entry fees' : isTournament ? 'Championship format' : 'Trail facts'}</strong><div>
            {categoryItems.map((item, index) => <span className={item.status === 'Sold out' ? 'event-category-soldout' : ''} key={`${item.name || item}-${index}`}>
              {item.name || item}{item.fee != null ? ` · ${money(item.fee)}` : ''}{item.status ? ` · ${item.status}` : ''}
            </span>)}
          </div></div>
          {(event.highlights?.length || event.inclusions?.length || event.eventNotes?.length) ? <details className="trek-detail-panel">
            <summary>{isTrek ? <Mountain size={16}/> : isTournament ? <Trophy size={16}/> : isCycling ? <Bike size={16}/> : <ClipboardList size={16}/>} {isTrek ? 'View trail experience & package inclusions' : isTournament ? 'View schedule, eligibility & team format' : isCycling ? 'View ride details, route & registration deadline' : 'View race-day information'} <ChevronDown size={16}/></summary>
            <div className="trek-detail-content">
              {event.highlights?.length > 0 && <><div className="trek-section-heading"><strong>Trail highlights</strong><small>As described by the operator</small></div><ul className="verified-event-list">{event.highlights.map(item => <li key={item}>{item}</li>)}</ul></>}
              {event.eventNotes?.length > 0 && <><div className="trek-section-heading"><strong>Event information</strong></div><ul className="verified-event-list">{event.eventNotes.map(item => <li key={item}>{item}</li>)}</ul></>}
              {event.inclusions?.length > 0 && <><div className="trek-section-heading"><strong>Included in the official trek fee</strong></div><div className="trek-carry-list">{event.inclusions.map(item => <span key={item}><Check size={13}/>{item}</span>)}</div></>}
              {event.exclusions?.length > 0 && <><div className="trek-section-heading"><strong>Not included</strong></div><ul className="verified-event-list">{event.exclusions.map(item => <li key={item}>{item}</li>)}</ul></>}
              {event.whatToCarry?.length > 0 && <><div className="trek-section-heading"><strong>Suggested items to carry</strong></div><div className="trek-carry-list">{event.whatToCarry.map(item => <span key={item}><Check size={13}/>{item}</span>)}</div></>}
            </div>
          </details> : null}
          {event.registrationNote && <p className="verified-event-note"><ShieldCheck size={14}/>{event.registrationNote}</p>}
          <div className="adventure-card-footer"><div><strong>{event.priceLabel || money(event.fee)}</strong><small>{event.priceNote || (isTrek ? 'Official listed trail price' : 'Official listed fee')}</small></div>
            <a className="primary-btn" href={event.registrationUrl || event.officialUrl} target="_blank" rel="noopener noreferrer">{event.actionLabel || 'View official details'} <ArrowUpRight size={16}/></a>
          </div>
          <div className="verified-source-link"><span>Source: {event.sourceLabel}</span><a href={event.detailsUrl || event.officialUrl} target="_blank" rel="noopener noreferrer">Official details <ArrowUpRight size={13}/></a></div>
        </div>
      </article>
    })}</div>
    <div className="availability-note"><ShieldCheck size={16}/><span>This feed is limited to Madurai and nearby Dindigul / Theni routes. Event dates, registration deadlines and fees were checked on 4 November 2026 and can change. Audax India handles cycling entries; Trek Tamil Nadu handles guided-trail dates and bookings. Open the official source before paying or travelling. Trek listings do not show a fixed public departure date, so select a currently available slot on the official portal.</span></div>
  </>
}
function AdventureRegistrationModal({ event, registration, onClose, onSubmit }) {
  const [form, setForm] = useState({ participantName: '', phone: '', email: '', option: event.options[0], packageId: event.packages?.[0]?.id || '', emergencyContact: '', groupSize: '1', experience: 'Beginner', notes: '' })
  const [error, setError] = useState('')
  const isTrek = event.kind === 'Trekking'
  const selectedPackage = event.packages?.find(pkg => pkg.id === form.packageId) || event.packages?.[0]
  const packageFee = selectedPackage?.fee || event.fee
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }))
  const submit = e => {
    e.preventDefault()
    if (!form.participantName.trim() || !form.phone.trim() || !form.emergencyContact.trim()) { setError('Enter your name, mobile number and emergency contact.'); return }
    if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim()) || !/^\+?[0-9\s-]{10,15}$/.test(form.emergencyContact.trim())) { setError('Enter valid mobile numbers.'); return }
    const groupSize = Number(form.groupSize)
    onSubmit({ ...form, participantName: form.participantName.trim(), phone: form.phone.trim(), email: form.email.trim(), emergencyContact: form.emergencyContact.trim(), groupSize, packageName: selectedPackage?.name || '', packageFee, totalAmount: packageFee * groupSize })
  }
  return <div className="modal-backdrop tournament-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="tournament-registration-modal adventure-registration-modal" role="dialog" aria-modal="true" aria-label={`${event.kind} registration`}><div className="tournament-modal-heading"><div><span className="section-kicker">{isTrek ? 'TREKKING BOOKING' : 'MARATHON REGISTRATION'}</span><h2>{registration ? 'Your saved details' : isTrek ? 'Reserve your trek place' : 'Register for the run'}</h2><p>{event.title}</p></div><button className="modal-close" type="button" onClick={onClose}><X size={19}/></button></div><div className="registration-event-strip"><span><MapPin size={15}/>{event.location}</span><span><CalendarDays size={15}/>{prettyDate(event.date)}</span><strong>{money(registration?.packageFee || packageFee)} / person</strong></div>{registration ? <div className="registration-detail-view"><div className="registration-success"><Check size={20}/><div><strong>{isTrek ? 'Trek booking request saved' : 'Marathon registration saved'}</strong><small>{registration.status} · {registration.id}</small></div></div><div className="registration-detail-grid"><div><small>Participant</small><strong>{registration.participantName}</strong></div><div><small>Mobile</small><strong>{registration.phone}</strong></div><div><small>Category / trail</small><strong>{registration.option}</strong></div><div><small>Emergency contact</small><strong>{registration.emergencyContact}</strong></div><div><small>Group size</small><strong>{registration.groupSize}</strong></div>{registration.packageName && <div><small>Package</small><strong>{registration.packageName}</strong></div>}{registration.totalAmount != null && <div><small>Estimated total</small><strong>{money(registration.totalAmount)}</strong></div>}</div><button type="button" className="primary-btn full" onClick={onClose}>Done</button></div> : <form className="tournament-registration-form" onSubmit={submit}><div className="registration-form-grid"><label className="registration-field"><span>Participant name *</span><input required value={form.participantName} onChange={e => update('participantName', e.target.value)} maxLength={80}/></label><label className="registration-field"><span>Mobile number *</span><input required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={16}/></label><label className="registration-field"><span>Email address</span><input type="email" value={form.email} onChange={e => update('email', e.target.value)} maxLength={100}/></label><BootstrapDropdown label={isTrek ? 'Trail difficulty' : 'Race category'} value={form.option} options={event.options.map(option => ({ value: option, label: option }))} onChange={value => update('option', value)} inlineMenu className="registration-dropdown-field"/><label className="registration-field"><span>Emergency contact *</span><input required type="tel" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} maxLength={16}/></label>{isTrek && <label className="registration-field"><span>Group size</span><input type="number" min="1" max="20" value={form.groupSize} onChange={e => update('groupSize', e.target.value)}/></label>}</div>{isTrek && event.packages?.length > 0 && <div className="registration-field trek-package-select"><BootstrapDropdown label="Select package" value={form.packageId} options={event.packages.map(pkg => ({ value: pkg.id, label: `${pkg.name} · ${money(pkg.fee)} per person` }))} onChange={value => update('packageId', value)} inlineMenu className="registration-dropdown-field"/><small>Estimated group total: {money(packageFee * Math.max(1, Number(form.groupSize) || 1))}</small></div>}{isTrek && <BootstrapDropdown label="Trekking experience" value={form.experience} options={['Beginner','Intermediate','Experienced'].map(item => ({ value: item, label: item }))} onChange={value => update('experience', value)} inlineMenu className="registration-dropdown-field"/>}<label className="registration-field"><span>Notes / medical or dietary information (optional)</span><textarea rows="2" value={form.notes} onChange={e => update('notes', e.target.value)} maxLength={500}/></label>{error && <div className="form-error">{error}</div>}<div className="registration-form-note"><ShieldCheck size={15}/> Demo only. This does not confirm a real event seat or a guided trek booking.</div><div className="registration-form-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn">{isTrek ? 'Save trek request' : 'Submit registration'} <ArrowRight size={16}/></button></div></form>}</section></div>
}

function CustomerAuthModal({ mode, setMode, form, update, onSubmit, error, notice, onClose }) {
  return <div className="auth-gate-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="auth-gate-card" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title">
      <button className="auth-gate-close" type="button" onClick={onClose} aria-label="Continue browsing as guest"><X size={19}/></button>
      <div className="auth-gate-brand"><span className="brand-mark"><Trophy size={20}/></span><strong>fieldfinder<span>.</span></strong></div>
      <span className="form-kicker">CUSTOMER ACCOUNT</span>
      <h2 id="customer-auth-title">{mode === 'login' ? 'Sign in to continue' : 'Create your customer account'}</h2>
      <p className="auth-gate-subtitle">{notice || 'Browse venues freely. Sign in or register only when you are ready to book.'}</p>
      <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>
      <form onSubmit={onSubmit}>
        <label className="form-field"><span>Username</span><div className="input-wrap"><UserRound size={17}/><input value={form.username} onChange={event => update('username', event.target.value)} placeholder="Enter your username" autoComplete="username" minLength={3} maxLength={40} required/></div></label>
        {mode === 'register' && <label className="form-field"><span>Email address</span><div className="input-wrap"><Mail size={17}/><input type="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={150} required/></div></label>}
        <label className="form-field"><span>Password</span><div className="input-wrap"><LockKeyhole size={17}/><input type="password" value={form.password} onChange={event => update('password', event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} required/></div></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-btn full auth-gate-submit" type="submit">{mode === 'login' ? 'Sign in and continue' : 'Create account and continue'} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-gate-footnote"><ShieldCheck size={15}/><span>Accounts are checked and stored by the FieldFinder backend. Email / SMS OTP verification is not enabled yet, so use an email address you control.</span></div>
      <button type="button" className="auth-guest-continue" onClick={onClose}>Continue browsing as guest</button>
    </section>
  </div>
}

function DiscoverPage({ venues, total, search, setSearch, sport, setSport, areas, area, setArea, onOpen, onGoPlayers, adventureEvents, onNavigateAnnouncement, onGoPage }) {
  const directoryRef = useRef(null)
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !directoryRef.current) return undefined
    const cards = directoryRef.current.querySelectorAll('[data-reveal-card]')
    if (!cards.length) return undefined
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Venue cards fade in again on every viewport entry, including when
        // the visitor scrolls back upward through the directory.
        entry.target.classList.toggle('is-revealed', entry.isIntersecting)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    cards.forEach(card => { card.classList.add('reveal-pending'); observer.observe(card) })
    return () => observer.disconnect()
  }, [venues])
  const areaOptions = areas.map(item => ({ value: item, label: item, description: item === 'All areas' ? 'Show every listed venue' : 'Madurai venue area' }))
  const sportTiles = [
    { name: 'Football', sub: 'Turf & five-a-side', icon: '⚽', image: '/assets/sport-cards/football.webp', position: 'center 54%' },
    { name: 'Cricket', sub: 'Nets & box cricket', icon: '🏏', image: '/assets/sport-cards/cricket.webp', position: 'center 52%' },
    { name: 'Badminton', sub: 'Courts & academies', icon: '🏸', image: '/assets/sport-cards/badminton.webp', position: 'center 48%' },
    { name: 'Running', sub: 'Tracks & endurance', icon: '🏃', image: '/assets/sport-cards/running.webp', position: 'center 55%' },
    { name: 'Pickleball', sub: 'Find a court', icon: '🎾', image: '/assets/sport-cards/pickleball.webp', position: 'center 48%' },
    { name: 'Paintball', sub: 'Action arenas', icon: '🎯', image: '/assets/sport-cards/paintball.webp', position: 'center 50%' },
    { name: 'Boxing', sub: 'Training & fitness', icon: '🥊', image: '/assets/sport-cards/boxing.webp', position: 'center 48%' }
  ]
  const featuredVenues = venues.slice(0, 3)
  const scrollToDirectory = () => document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return <div className="experiment-home">
    <section className="experiment-hero">
      <div className="experiment-hero-text">
        <span className="experiment-overline"><i/> MADE FOR THE WAY MADURAI PLAYS</span>
        <h1 className="experiment-hero-title"><span>Find your</span><span><em>next game.</em></span></h1>
        <p>From quick turf matches to discovering a new sport. Find a place, bring your people and get out there.</p>
        <div className="experiment-hero-actions"><button className="primary-btn" onClick={scrollToDirectory}>Explore venues <ArrowRight size={17}/></button><button className="experiment-outline-btn" onClick={() => onGoPage('events')}>See local events <ArrowUpRight size={16}/></button></div>
        <div className="experiment-hero-search"><Search size={18}/><input id="venue-search" value={search} onChange={e => { setSearch(e.target.value); if (sport !== 'All') setSport('All') }} placeholder="Search a sport, venue or area"/><button type="button" onClick={scrollToDirectory}>Find a place</button></div>
        <div className="experiment-hero-footnote"><span><b>{total}</b> venue listings</span><i/><span>7 sports to explore</span><i/><span>Madurai region</span></div>
      </div>
      <div className="experiment-hero-visual" aria-label="Sports venues in the Madurai region">
        <div className="experiment-hero-photo main-photo"><img data-scroll-parallax src="/assets/venues/jaypal-sports-center.webp" alt="Sports turf at Jaypal Sports Center"/><span className="experiment-photo-label"><small>START WITH A PLACE</small><strong>Make the first move.</strong></span></div>
        <div className="experiment-hero-photo side-photo"><img data-scroll-parallax src="/assets/venues/sai-academy-of-badminton.webp" alt="Badminton court"/><span>COURTS · TURFS · ARENAS</span></div>
        <div className="experiment-hero-sticker"><Trophy size={23}/><span><b>Game on.</b><small>Find your crew</small></span></div>
        <div className="experiment-hero-orbit orbit-one"/><div className="experiment-hero-orbit orbit-two"/>
        <span className="experiment-hero-index">01 / PLAY MORE</span>
      </div>
    </section>

    <HomeAnnouncementMarquee adventureEvents={adventureEvents} onNavigate={onNavigateAnnouncement}/>

    <section className="experiment-sports-section" data-exp-reveal>
      <div className="experiment-section-heading"><div><span className="section-kicker">CHOOSE YOUR GAME</span><h2>One city. So many ways to play.</h2><p>Explore the sports and spaces that get you moving.</p></div><button className="experiment-text-link" onClick={scrollToDirectory}>Browse all venues <ArrowUpRight size={16}/></button></div>
      <div className="experiment-sport-grid">{sportTiles.map((item, index) => <button className="experiment-sport-card" key={item.name} onClick={() => { setSport(item.name); scrollToDirectory() }} data-exp-reveal style={{'--reveal-index': index}} aria-label={`Explore ${item.name} venues`}><span className="experiment-sport-art"><img src={item.image} alt={`${item.name} activity`} loading="lazy" decoding="async" style={{objectPosition:item.position}}/></span><span className="experiment-sport-symbol" aria-hidden="true">{item.icon}</span><span className="experiment-sport-copy"><strong>{item.name}</strong><small>{item.sub}</small></span><span className="experiment-sport-arrow"><ArrowUpRight size={18}/></span></button>)}</div>
    </section>

    <div className="experiment-manifesto-marquee" aria-label="Play more. Explore more."><div className="experiment-manifesto-track">{Array.from({length: 2}, (_, index) => <span key={index}>PLAY MORE <i>✳</i> EXPLORE MORE <i>✳</i> FIND YOUR GAME <i>✳</i> MAKE IT HAPPEN <i>✳</i></span>)}</div></div>

    <section className="experiment-story-section" data-exp-reveal>
      <div className="experiment-story-image" data-reveal-direction="left"><img data-scroll-parallax src="/assets/venues/bats-and-boots-turf.webp" alt="Football turf in Madurai" loading="lazy"/><span className="experiment-image-stamp">YOUR NEXT<br/>MOVE STARTS HERE</span></div>
      <div className="experiment-story-copy" data-reveal-direction="right"><span className="section-kicker">MORE THAN A PLACE TO PLAY</span><h2>Make room<br/>for <em>more play.</em></h2><p>Find the court for your usual game. Try something you’ve never played. Or pull your friends together for a weekend match.</p><div className="experiment-story-points"><span><b>01</b> Discover a venue near you</span><span><b>02</b> Check the facilities and media</span><span><b>03</b> Bring your team together</span></div><button className="primary-btn" onClick={scrollToDirectory}>Find your venue <ArrowRight size={16}/></button></div>
    </section>

    <section className="directory-section experiment-directory" id="venue-directory" ref={directoryRef}>
      <div className="experiment-section-heading directory-heading" data-exp-reveal><div><span className="section-kicker">THE LOCAL DIRECTORY</span><h2>Find a place to play.</h2><p>Explore all {total} listed venues, with photos, owner-published videos and contact options around Madurai.</p></div><span className="listing-count"><i/>{total} listings</span></div>
      <div className="experiment-directory-tools"><div className="search-field"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venue, sport or area"/><button onClick={() => setSearch('')} aria-label="Clear search"><X size={15}/></button></div><div className="area-filter-dropdown"><BootstrapDropdown label="Filter by area" value={area} options={areaOptions} onChange={setArea} searchable placeholder="All Madurai areas"/></div></div>
      <div className="filter-toolbar"><div className="sport-filters">{SPORTS.map(item => <button key={item} className={sport === item ? 'selected' : ''} onClick={() => setSport(item)}>{item === 'All' ? <SlidersHorizontal size={14}/> : null}{item}</button>)}</div></div>
      <div className="venue-result-line"><span><b>{venues.length}</b> places to explore</span><span>Owner-published media appears when available.</span></div>
      <div className="venue-grid">{venues.map((venue, index) => <VenueCard key={venue.id} venue={venue} onClick={() => onOpen(venue)} revealIndex={index}/>)}{venues.length === 0 && <div className="empty-state"><Search size={28}/><strong>No venues found</strong><p>Try another search term, sport or area.</p><button className="secondary-btn" onClick={() => { setSearch(''); setSport('All'); setArea('All areas') }}>Clear filters</button></div>}</div>
    </section>

    <section className="experiment-community-section" data-exp-reveal>
      <div className="experiment-community-visual" data-reveal-direction="left"><img data-scroll-parallax src="/assets/venues/hatrick-sports-arena.webp" alt="Group playing on a sports turf" loading="lazy"/><span className="community-count"><Users size={17}/><b>Bring your people</b><small>Find players around your game</small></span></div>
      <div className="experiment-community-copy" data-reveal-direction="right"><span className="section-kicker">GOOD GAMES ARE BETTER TOGETHER</span><h2>Have a team?<br/><em>Find a few more.</em></h2><p>Connect with other players around your sport and venue. Make the next game happen.</p><button className="primary-btn" onClick={onGoPlayers}>Find players <Users size={16}/></button></div>
    </section>
    <section className="experiment-last-callout" data-exp-reveal><div><span className="section-kicker">THE MADURAI SPORTS CALENDAR</span><h2>Make a date with the outdoors.</h2><p>Discover local cycling events, guided trails and tournament listings.</p></div><div className="experiment-last-actions"><button className="primary-btn" onClick={() => onGoPage('events')}>Events & adventures <ArrowUpRight size={16}/></button><button className="experiment-outline-btn" onClick={() => onGoPage('tournaments')}>Explore tournaments <Trophy size={16}/></button></div></section>
    <div className="availability-note"><ShieldCheck size={16}/><span><b>Experimental demo.</b> Venue availability, booking prices and payment actions are not live-confirmed. Customer sign-in is requested only when you begin a protected booking or account action.</span></div>
  </div>
}

function VenueCard({ venue, onClick, revealIndex = 0 }) {
  const fallback = venue.photoIllustration ? `/${venue.photoIllustration.replace(/^\//,'')}` : '/assets/venue-illustrations/turf.svg'
  const [src, setSrc] = useState(venue.photoUrl || fallback)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setSrc(venue.photoUrl || fallback); setFailed(false) }, [venue.photoUrl, fallback])
  return <div className="venue-card-wrap" data-reveal-card style={{"--reveal-index": revealIndex % 3}}>
    <button className="venue-card" onClick={onClick}>
      <div className="venue-photo">
        <img src={src} onError={() => { if (!failed) { setFailed(true); setSrc(fallback) } }} alt={`${venue.name} sports venue`} loading="lazy" decoding="async"/>
        <span className="photo-badge">{venue.photoKind === 'venue-specific' ? 'VENUE PHOTO' : venue.photoKind === 'generated-illustration' ? 'ILLUSTRATIVE IMAGE' : venue.photoKind === 'activity-illustration' ? 'SPORT PREVIEW' : 'VENUE LISTING'}</span>
        <span className="photo-arrow"><ArrowUpRight size={18}/></span>
      </div>
      <div className="venue-info">
        <span className="venue-area"><MapPin size={13}/>{venue.area || 'Madurai'}</span>
        <span className="verification-hint">{venue.externalListing ? (/official/i.test(venue.source || '') ? 'Official venue page · check availability' : 'Online listing · call to confirm') : 'Directory listing · details to verify'}</span>
        <h3>{venue.name}</h3>
        <p className="venue-summary">{venue.summary || venue.type || 'Sports venue listing'}</p>
        <div className="sport-tags">{(venue.sports || []).slice(0,3).map(item => <span key={item}>{item}</span>)}</div>
        <div className="venue-card-foot"><span>{venue.externalListing ? 'View details & contact' : 'View details & demo slots'}</span><ArrowRight size={16}/></div>
      </div>
    </button>
    <a className="venue-directions-link" href={googleMapsDirectionsUrl(venue)} target="_blank" rel="noopener noreferrer" aria-label={`Get Google Maps directions to ${venue.name}`}>
      <MapPinned size={15}/> Get directions <ArrowUpRight size={14}/>
    </a>
  </div>
}

function BookingModal({ venue, onFindPlayers, date, setDate, duration, setDuration, selectedTime, setSelectedTime, slots, coupon, setCoupon, appliedCoupon, couponError, applyCoupon, price, onClose, onContinue }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="booking-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="booking-modal-photo"><img src={venue.photoUrl || '/assets/venue-illustrations/turf.svg'} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = venue.photoIllustration ? `/${venue.photoIllustration}` : '/assets/venue-illustrations/turf.svg' }} alt={venue.name}/><span>{venue.photoKind === 'generated-illustration' ? 'ILLUSTRATIVE IMAGE · NOT A VERIFIED VENUE PHOTO' : venue.photoKind === 'activity-illustration' ? 'SPORT PREVIEW · ILLUSTRATION' : 'VENUE DETAILS'}</span></div><div className="booking-modal-content"><div className="modal-heading"><span className="section-kicker">FIELD FINDER VENUE</span><h2>{venue.name}</h2><p><MapPin size={15}/>{venue.address || venue.area}</p></div><a className="venue-modal-directions" href={googleMapsDirectionsUrl(venue)} target="_blank" rel="noopener noreferrer"><MapPinned size={17}/> Get directions in Google Maps <ArrowUpRight size={15}/></a><p className="venue-description">{venue.summary}</p><div className="sport-tags modal-sports">{(venue.sports || []).map(s => <span key={s}>{s}</span>)}</div><button className="find-players-link" type="button" onClick={onFindPlayers}><Users size={15}/> Find players for this game</button>{!venue.externalListing && <div className="demo-info"><ShieldCheck size={16}/><span>Sample availability only. Confirm the slot with the venue before relying on it.</span></div>}
      {venue.media?.length > 0 && <section className="venue-media-gallery"><div className="gallery-heading"><h3><Images size={17}/> Venue photos & videos</h3><span>{venue.media.length} items</span></div><div className="venue-media-grid">{venue.media.map(item => <div className="venue-media-item" key={item.id}>{item.type === 'VIDEO' ? <video src={mediaUrl(item.url)} controls preload="metadata" playsInline/> : <img src={mediaUrl(item.url)} alt={item.caption || venue.name} loading="lazy"/>}<small>{item.caption || (item.type === 'VIDEO' ? 'Venue video' : 'Venue photo')}</small></div>)}</div></section>}
      {venue.externalListing ? <section className="external-venue-panel"><div className="external-venue-banner"><ShieldCheck size={17}/><span>Venue-managed activity. FieldFinder does not hold live slots or take payment for this listing.</span></div>
        {venue.pricingInfo && <div className="external-venue-fact"><strong>Pricing</strong><p>{venue.pricingInfo}</p></div>}
        {venue.openingHours && <div className="external-venue-fact"><strong>Hours / session information</strong><p>{venue.openingHours}</p></div>}
        {venue.venueHighlights?.length > 0 && <div className="external-venue-fact"><strong>What is listed</strong><ul>{venue.venueHighlights.map(item => <li key={item}>{item}</li>)}</ul></div>}
        <div className="external-venue-actions">{venue.contactPhone && <a className="primary-btn" href={`tel:${venue.contactPhone.replace(/[^+0-9]/g, '')}`}><PhoneCall size={16}/> Call venue</a>}{venue.bookingUrl && <a className="secondary-btn" href={venue.bookingUrl} target="_blank" rel="noopener noreferrer"><CalendarDays size={16}/> {venue.bookingUrl.includes('hudle.in') ? 'Book on Hudle' : venue.bookingUrl.includes('universaladventures') ? 'View activity listing' : 'Booking / enquiry'} <ArrowUpRight size={15}/></a>}{venue.websiteUrl && venue.websiteUrl !== venue.bookingUrl && <a className="secondary-btn" href={venue.websiteUrl} target="_blank" rel="noopener noreferrer"><Globe size={16}/> Venue website <ArrowUpRight size={15}/></a>}</div>
        <small className="external-venue-source">Information source: {venue.source || 'Online listing'} · checked {venue.sourceChecked || 'recently'}. Details may change; contact the operator before travelling or paying.</small>
      </section> : <><div className="booking-fields"><label><span>Booking date</span><input type="date" min={todayISO()} value={date} onChange={e => { setDate(e.target.value); setSelectedTime('') }}/></label><BootstrapDropdown label="Duration" value={String(duration)} options={[1,2,3,4].map(n => ({ value: String(n), label: `${n} ${n === 1 ? 'hour' : 'hours'}` }))} onChange={value => { setDuration(Number(value)); setSelectedTime('') }} inlineMenu/></div>
      <div className="slot-heading"><div><strong>Available start times</strong><small>{prettyDate(date)} · {duration} hour{duration > 1 ? 's' : ''}</small></div><span className="slot-legend"><i/> Available <i className="busy-dot"/> Unavailable</span></div>
      <div className="slot-grid">{slots.map(slot => <button key={slot.time} disabled={!slot.available} className={`${selectedTime === slot.time ? 'chosen' : ''} ${slot.available ? '' : 'unavailable'}`} onClick={() => setSelectedTime(slot.time)}>{prettyTime(slot.time)}{!slot.available && <small>Unavailable</small>}</button>)}</div>
      <div className="price-coupon"><div className="coupon-input"><input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Promo code (PLAY10)"/><button onClick={applyCoupon}>Apply</button></div>{couponError && <small className="coupon-error">{couponError}</small>}{appliedCoupon && <small className="coupon-success"><Check size={13}/>{appliedCoupon} applied</small>}<div className="price-line"><span>{duration} × {money(RATE_PER_HOUR)} / hour</span><strong>{money(price.subtotal)}</strong></div>{price.discount > 0 && <div className="price-line discount-line"><span>Discount ({price.discountPercent}%)</span><strong>−{money(price.discount)}</strong></div>}<div className="price-total"><span>Estimated total</span><strong>{money(price.total)}</strong></div><small className="rate-note">Demo rate: ₹800 per hour. Promo codes: PLAY10 (2+ hours), TEAM15 (3+ hours), WEEKDAY5. Availability and pricing are not live-verified.</small></div>
      <button className="primary-btn full" disabled={!selectedTime} onClick={onContinue}>Continue to secure booking <ArrowRight size={17}/></button></>}
    </div></div></div>
}

function CheckoutModal({ venue, date, time, duration, price, paymentMethod, setPaymentMethod, onBack, onConfirm }) {
  return <div className="modal-backdrop checkout-layer"><div className="checkout-modal"><button className="modal-close" onClick={onBack}><X/></button><span className="section-kicker">DEMO CHECKOUT</span><h2>Review your booking</h2><p className="checkout-sub">Check the details before completing this demo booking.</p><div className="checkout-venue"><div><strong>{venue.name}</strong><span>{prettyDate(date)} · {prettyTime(time)} · {duration} hour{duration > 1 ? 's' : ''}</span></div><b>{money(price.total)}</b></div><div className="checkout-breakdown"><div><span>Slot subtotal</span><b>{money(price.subtotal)}</b></div><div><span>Discount</span><b className="discount-text">−{money(price.discount)}</b></div><div className="total-row"><span>Total to pay</span><strong>{money(price.total)}</strong></div></div><h3>Choose payment method</h3><div className="payment-options"><button className={paymentMethod === 'UPI demo' ? 'active' : ''} onClick={() => setPaymentMethod('UPI demo')}><Wallet/><span><b>UPI</b><small>Simulated demo payment</small></span><i/></button><button className={paymentMethod === 'Card demo' ? 'active' : ''} onClick={() => setPaymentMethod('Card demo')}><CreditCard/><span><b>Card</b><small>No card details collected</small></span><i/></button><button className={paymentMethod === 'Pay at venue (demo)' ? 'active' : ''} onClick={() => setPaymentMethod('Pay at venue (demo)')}><Banknote/><span><b>Pay at venue</b><small>Mark as pending in demo</small></span><i/></button></div><div className="payment-disclaimer"><ShieldCheck size={17}/><span>This is a payment-interface prototype. No bank, UPI or card transaction will occur.</span></div><button className="primary-btn full" onClick={onConfirm}>{paymentMethod === 'Pay at venue (demo)' ? 'Confirm demo booking' : 'Simulate successful payment'} <ArrowRight size={17}/></button></div></div>
}

function BookingsPage({ bookings, filter, setFilter, onCancel }) {
  return <><PageHeader kicker="YOUR ACTIVITY" title="My bookings" description="Review your reservations and manage demo booking requests."/><div className="booking-filters">{['All','Awaiting owner confirmation','Confirmed','Cancelled'].map(item => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="customer-booking-list">{bookings.length ? bookings.map(b => <article className="customer-booking-card" key={b.id}><div className="booking-card-main"><span className="booking-ref">{b.id}</span><h3>{b.venueName}</h3><p><MapPin size={14}/>{b.area}</p><div className="booking-facts"><span><CalendarDays size={14}/>{prettyDate(b.date)}</span><span><Clock3 size={14}/>{prettyTime(b.time)}</span><span><Activity size={14}/>{b.duration} hour{b.duration > 1 ? 's' : ''}</span></div></div><div className="booking-card-side"><strong>{money(b.total)}</strong><span className={`status-pill ${b.status === 'Cancelled' ? 'cancelled' : b.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>{b.status}</span><small>Payment: {b.paymentStatus}</small>{b.status !== 'Cancelled' && <button className="text-danger" onClick={() => onCancel(b.id)}>Cancel booking</button>}</div></article>) : <div className="empty-state"><CalendarDays size={30}/><strong>No bookings yet</strong><p>Your booking requests will appear here after checkout.</p></div>}</div><div className="availability-note"><ShieldCheck size={16}/><span>Bookings are stored in this browser for demo purposes. The shared backend will provide real owner confirmation and cancellation later.</span></div></>
}
function BootstrapDropdown({ label, value, options, onChange, searchable = false, placeholder = 'Select an option', inlineMenu = false, className = '' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const activeOption = options.find(option => option.value === value)
  const visibleOptions = searchable && query.trim()
    ? options.filter(option => `${option.label} ${option.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutside = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('touchstart', closeOnOutside, { passive: true })
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('touchstart', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  function choose(option) {
    onChange(option.value)
    setOpen(false)
    setQuery('')
  }

  return <div className={`ff-dropdown-field ${className}`}><span className="ff-dropdown-label">{label}</span>
    <div className={`dropdown ff-bootstrap-dropdown ${open ? 'show' : ''}`} ref={rootRef}>
      <button type="button" className="btn dropdown-toggle ff-dropdown-toggle" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen(current => !current); setQuery('') }}>
        <span className="ff-dropdown-current">{activeOption?.label || placeholder}</span>
        <ChevronDown size={16} aria-hidden="true"/>
      </button>
      <div className={`dropdown-menu ff-dropdown-menu ${inlineMenu ? 'ff-dropdown-menu-inline' : ''} ${open ? 'show' : ''}`} role="listbox" aria-label={label}>
        {searchable && <div className="ff-dropdown-search"><Search size={16}/><input aria-label={`Search ${label.toLowerCase()}`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search venue or area" onKeyDown={event => { if (event.key !== 'Escape') event.stopPropagation() }}/>{query && <button type="button" aria-label="Clear dropdown search" onClick={() => setQuery('')}><X size={14}/></button>}</div>}
        <div className="ff-dropdown-options">
          {visibleOptions.map(option => <button type="button" key={option.value || '__all__'} role="option" aria-selected={value === option.value} className={`dropdown-item ff-dropdown-item ${value === option.value ? 'selected' : ''}`} onClick={() => choose(option)}>
            <span className="ff-option-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
            {value === option.value && <Check size={16} aria-hidden="true"/>}
          </button>)}
          {!visibleOptions.length && <div className="ff-dropdown-empty">No matching venues. Try another name or area.</div>}
        </div>
        <div className="ff-dropdown-footer">{searchable ? `${visibleOptions.length} of ${options.length} venues` : `${options.length} options`}</div>
      </div>
    </div>
  </div>
}

function PlayersPage({ venues, selectedVenueId, setSelectedVenueId, sport, setSport, search, setSearch, invited, onInvite }) {
  const venue = venues.find(v => v.id === selectedVenueId)
  const venueOptions = [
    { value: '', label: 'All Madurai areas', description: 'Show players across Madurai' },
    ...venues.map(item => ({ value: item.id, label: item.name, description: item.area || 'Madurai' }))
  ]
  const sportOptions = ['All','Football','Cricket','Badminton','Pickleball','Paintball','Boxing'].map(item => ({ value: item, label: item === 'All' ? 'All sports' : item }))
  const targetArea = venue?.area?.split('·')[0].trim().toLowerCase() || ''
  const filtered = demoPeople.filter(p => {
    const matchesSport = sport === 'All' || p.sports.includes(sport)
    const matchesSearch = `${p.name} ${p.area} ${p.sports.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    const genericArea = !targetArea || targetArea.includes('madurai') || targetArea.includes('confirm')
    const matchesArea = genericArea || p.area.toLowerCase().includes(targetArea) || targetArea.includes(p.area.toLowerCase())
    return matchesSport && matchesSearch && (!selectedVenueId || matchesArea)
  })
  return <><PageHeader kicker="PLAY TOGETHER" title="Find players" description="Discover demo player profiles by sport and the area around your selected venue."/><div className="player-search-panel"><BootstrapDropdown label="Choose a turf or venue" value={selectedVenueId} options={venueOptions} onChange={setSelectedVenueId} searchable placeholder="All Madurai areas"/><BootstrapDropdown label="Sport" value={sport} options={sportOptions} onChange={setSport} placeholder="All sports"/><label className="player-search"><span>Search players or areas</span><div className="search-field"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, area or sport"/></div></label></div><div className="player-results-heading"><div><h2>{filtered.length} matching demo profiles</h2><p>{venue ? `Showing profiles around ${venue.name} · ${venue.area}` : 'Showing demo profiles across Madurai areas'}</p></div><span className="demo-tag"><Users size={14}/> Demo profiles</span></div><div className="player-grid">{filtered.map(person => <article className="player-card" key={person.id}><div className="player-card-top"><span className="player-avatar">{person.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span><span className="level-tag">{person.level}</span></div><h3>{person.name}</h3><p className="player-area"><MapPin size={14}/>{person.area}, Madurai</p><div className="sport-tags">{person.sports.map(s => <span key={s}>{s}</span>)}</div><div className="player-detail"><Users size={15}/><span>{person.lookingFor}</span></div><div className="player-detail"><Clock3 size={15}/><span>{person.times}</span></div><p className="player-note">{person.note}</p><button className="secondary-btn full" disabled={invited.has(person.id)} onClick={() => onInvite(person)}>{invited.has(person.id) ? <><Check size={15}/> Invite sent</> : <><UserRoundPlus size={15}/> Send game invite</>}</button><small className="demo-caption">Fictional demo profile · No contact details shown</small></article>)}</div><div className="availability-note"><ShieldCheck size={16}/><span>Player matching is a UI prototype. These are fictional profiles; no real members are being contacted. In production, matching will use consent-based profiles, location preferences and the chosen venue.</span></div></>
}
function TournamentsPage({ events, sport, setSport, registrations, onRegister, onRequireAuth, focusAnnouncement }) {
  const [activeEvent, setActiveEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(todayISO())

  useEffect(() => {
    if (!focusAnnouncement?.id) return
    const targetDate = events.find(event => event.id === focusAnnouncement.id)?.date
    if (targetDate) setSelectedDate(targetDate)
    const timer = window.setTimeout(() => {
      const target = document.querySelector(`[data-event-id="${focusAnnouncement.id}"]`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.add('announcement-focus')
      }
    }, 120)
    return () => window.clearTimeout(timer)
  }, [focusAnnouncement, events])

  const selectedEvents = events.filter(event => event.date === selectedDate)
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
  const shiftDate = direction => {
    const next = new Date(`${selectedDate}T12:00:00`)
    next.setDate(next.getDate() + direction)
    setSelectedDate(dateISO(next))
  }
  const registrationFor = event => registrations.find(item => item.eventId === event.id)

  return <>
    <PageHeader kicker="MADURAI SPORTS CALENDAR · DAILY FIXTURES" title="Tournaments" description="Choose a date to see the tournaments scheduled for that day and register your team with players and substitutes." />
    <div className="tournament-toolbar tournament-daily-toolbar">
      <div className="sport-filters" aria-label="Filter tournaments by sport">
        {['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Paintball', 'Boxing'].map(item => (
          <button key={item} type="button" className={sport === item ? 'selected' : ''} onClick={() => setSport(item)}>{item}</button>
        ))}
      </div>
      <div className="tournament-date-picker" aria-label="Choose tournament date">
        <button type="button" className="date-step-btn" onClick={() => shiftDate(-1)} aria-label="Previous day"><ChevronLeft size={18}/></button>
        <label className="tournament-date-field">
          <CalendarDays size={17}/>
          <span>Choose date</span>
          <input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} aria-label="Tournament date" />
        </label>
        <button type="button" className="date-today-btn" onClick={() => setSelectedDate(todayISO())}>Today</button>
        <button type="button" className="date-step-btn" onClick={() => shiftDate(1)} aria-label="Next day"><ChevronRight size={18}/></button>
      </div>
    </div>

    <section className="tournament-week tournament-day-results" aria-live="polite">
      <div className="week-heading">
        <div><span className="section-kicker">DAILY TOURNAMENT SCHEDULE</span><h2>{selectedDateLabel}</h2></div>
        <span>{selectedEvents.length} {selectedEvents.length === 1 ? 'tournament' : 'tournaments'} scheduled</span>
      </div>
      {selectedEvents.length ? <div className="tournament-grid">{selectedEvents.map(event => {
        const registration = registrationFor(event)
        return <article className="tournament-card" key={event.id} data-event-id={event.id}>
          <div className={`tournament-icon ${event.sport.toLowerCase()}`}><Trophy size={23}/></div>
          <div className="tournament-content">
            <div className="tournament-tags"><span>{event.sport}</span><span>{event.level}</span></div>
            <h3>{event.title}</h3>
            <p className="tournament-location"><MapPin size={14}/>{event.venueHint}</p>
            <div className="tournament-meta"><span><CalendarDays size={14}/>{prettyDate(event.date)}</span><span><Clock3 size={14}/>{event.time}</span></div>
            <div className="tournament-bottom">
              <div><strong>{money(event.fee)}</strong><small>{event.format} · {event.spots}</small></div>
              {registration
                ? <button className="secondary-btn registration-view-btn" type="button" onClick={() => setActiveEvent({ event, registration })}><Check size={15}/> View registration</button>
                : <button className="primary-btn" type="button" onClick={() => onRequireAuth(() => setActiveEvent({ event, registration: null }), 'Sign in or create a customer account before registering a tournament team.')}><Users size={15}/> Register team</button>}
            </div>
            {registration && <div className="registered-inline"><BadgeCheck size={14}/><span>Registered · {registration.teamName} · {1 + registration.players.length} players · {registration.substitutes.length} substitutes</span></div>}
          </div>
        </article>
      })}</div> : <div className="empty-state tournament-empty-state"><CalendarDays size={31}/><strong>No tournaments scheduled for this date</strong><p>Try another date or choose Today to return to the current schedule.</p><button className="secondary-btn" type="button" onClick={() => setSelectedDate(todayISO())}>Go to today</button></div>}
    </section>

    {registrations.length > 0 && <section className="my-tournament-registrations">
      <div className="week-heading"><div><span className="section-kicker">YOUR TEAMS</span><h2>My tournament registrations</h2></div><span>{registrations.length} submitted</span></div>
      <div className="my-registration-list">{registrations.map(registration => <article className="my-registration-card" key={registration.id}>
        <div><span className="registration-ref">{registration.id}</span><h3>{registration.teamName}</h3><p>{registration.eventTitle} · {prettyDate(registration.date)}</p><small>Captain: {registration.captain.name} · {registration.players.length + 1} players · {registration.substitutes.length} substitutes</small></div>
        <span className="registration-status"><Check size={13}/> Submitted</span>
      </article>)}</div>
    </section>}
    <div className="availability-note"><ShieldCheck size={16}/><span>These are sample demo events, not verified public tournaments. Registration details are saved only in this browser; no organiser is notified and no real entry fee is collected. Confirm roster size, date, venue and fee with the organiser before participating.</span></div>
    {activeEvent && <TournamentRegistrationModal event={activeEvent.event} registration={activeEvent.registration} onClose={() => setActiveEvent(null)} onSubmit={details => { onRegister(activeEvent.event, details); setActiveEvent(null) }} />}
  </>
}
function TournamentRegistrationModal({ event, registration, onClose, onSubmit }) {
  const [form, setForm] = useState({ teamName: '', captainName: '', captainPhone: '', captainEmail: '', players: [{ id: 1, name: '', phone: '' }], substitutes: [{ id: 2, name: '', phone: '' }] })
  const [error, setError] = useState('')
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const updateRoster = (group, id, key, value) => setForm(prev => ({ ...prev, [group]: prev[group].map(person => person.id === id ? { ...person, [key]: value } : person) }))
  const addRoster = group => setForm(prev => ({ ...prev, [group]: [...prev[group], { id: Date.now() + Math.random(), name: '', phone: '' }] }))
  const removeRoster = (group, id) => setForm(prev => ({ ...prev, [group]: prev[group].filter(person => person.id !== id) }))
  const submit = eventObject => {
    eventObject.preventDefault()
    const players = form.players.filter(person => person.name.trim())
    if (!form.teamName.trim() || !form.captainName.trim() || !form.captainPhone.trim()) { setError('Enter your team name and the captain’s name and mobile number.'); return }
    if (!/^\+?[0-9\s-]{10,15}$/.test(form.captainPhone.trim())) { setError('Enter a valid captain mobile number.'); return }
    if (players.length < 1) { setError('Add at least one player besides the captain.'); return }
    onSubmit({ ...form, players })
  }
  return <div className="modal-backdrop tournament-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="tournament-registration-modal" role="dialog" aria-modal="true" aria-labelledby="tournament-register-title">
      <div className="tournament-modal-heading"><div><span className="section-kicker">{registration ? 'YOUR TEAM ENTRY' : 'TOURNAMENT SIGN-UP'}</span><h2 id="tournament-register-title">{registration ? 'Registration details' : 'Register your team'}</h2><p>{event.title}</p></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      <div className="registration-event-strip"><span><Trophy size={16}/>{event.sport} · {event.format}</span><span><CalendarDays size={15}/>{prettyDate(event.date)} · {event.time}</span><strong>{money(event.fee)} entry fee</strong></div>
      {registration ? <div className="registration-detail-view"><div className="registration-success"><BadgeCheck size={21}/><div><strong>Team registration saved</strong><small>{registration.status} · {registration.id}</small></div></div><div className="registration-detail-grid"><div><small>Team name</small><strong>{registration.teamName}</strong></div><div><small>Captain</small><strong>{registration.captain.name}</strong></div><div><small>Captain mobile</small><strong>{registration.captain.phone}</strong></div><div><small>Captain email</small><strong>{registration.captain.email || 'Not provided'}</strong></div></div><RosterSummary title="Players" people={[{ name: registration.captain.name, phone: registration.captain.phone, role: 'Captain' }, ...registration.players.map(p => ({ ...p, role: 'Player' }))]}/><RosterSummary title="Substitutes" people={registration.substitutes.map(p => ({ ...p, role: 'Substitute' }))}/><button className="primary-btn full" type="button" onClick={onClose}>Done</button></div> : <form onSubmit={submit} className="tournament-registration-form"><div className="registration-form-grid"><label className="registration-field"><span>Team name *</span><input value={form.teamName} onChange={e => update('teamName', e.target.value)} placeholder="e.g. Madurai Strikers" required maxLength={60}/></label><label className="registration-field"><span>Captain name *</span><input value={form.captainName} onChange={e => update('captainName', e.target.value)} placeholder="Full name" required maxLength={60}/></label><label className="registration-field"><span>Captain mobile number *</span><input type="tel" value={form.captainPhone} onChange={e => update('captainPhone', e.target.value)} placeholder="10-digit mobile number" required maxLength={16}/></label><label className="registration-field"><span>Captain email <small>(optional)</small></span><input type="email" value={form.captainEmail} onChange={e => update('captainEmail', e.target.value)} placeholder="team@example.com" maxLength={100}/></label></div>
        <RosterEditor title="Players" subtitle="The captain is counted as one player. Add the rest of your squad here." group="players" roster={form.players} onAdd={addRoster} onUpdate={updateRoster} onRemove={removeRoster} required/>
        <RosterEditor title="Substitutes" subtitle="Add reserve players who may be used during the tournament." group="substitutes" roster={form.substitutes} onAdd={addRoster} onUpdate={updateRoster} onRemove={removeRoster}/>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="registration-form-note"><ShieldCheck size={15}/> This is a demo registration only. No real organiser will receive these details.</div>
        <div className="registration-form-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Check size={16}/> Submit registration</button></div>
      </form>}
    </section>
  </div>
}

function RosterEditor({ title, subtitle, group, roster, onAdd, onUpdate, onRemove, required = false }) {
  return <section className="roster-editor"><div className="roster-editor-heading"><div><h3>{title} <span>{roster.filter(p => p.name.trim()).length}</span></h3><p>{subtitle}</p></div><button type="button" className="add-roster-btn" onClick={() => onAdd(group)}><Plus size={15}/> Add {title === 'Players' ? 'player' : 'substitute'}</button></div>{roster.map((person, index) => <div className="roster-input-row" key={person.id}><span className="roster-number">{String(index + 1).padStart(2, '0')}</span><label><span>{title === 'Players' ? 'Player' : 'Substitute'} name {required && index === 0 ? '*' : ''}</span><input value={person.name} onChange={e => onUpdate(group, person.id, 'name', e.target.value)} placeholder="Full name" required={required && index === 0} maxLength={60}/></label><label><span>Mobile <small>(optional)</small></span><input type="tel" value={person.phone} onChange={e => onUpdate(group, person.id, 'phone', e.target.value)} placeholder="Phone number" maxLength={16}/></label><button type="button" className="remove-roster-btn" onClick={() => onRemove(group, person.id)} disabled={required && roster.length === 1} aria-label={`Remove ${title === 'Players' ? 'player' : 'substitute'}`}><X size={16}/></button></div>)}</section>
}

function RosterSummary({ title, people }) {
  return <section className="roster-summary"><div className="roster-summary-heading"><h3>{title}</h3><span>{people.length}</span></div>{people.length ? <div className="roster-summary-list">{people.map((person, index) => <div key={`${person.role}-${index}`}><span className="roster-summary-index">{String(index + 1).padStart(2, '0')}</span><strong>{person.name}</strong><small>{person.role}{person.phone ? ` · ${person.phone}` : ''}</small></div>)}</div> : <p className="roster-empty">No substitutes added.</p>}</section>
}

function ProfilePage({ user, bookings, invites, onLogout }) {
  return <><PageHeader kicker="ACCOUNT" title="My profile" description="Your FieldFinder customer account and activity overview."/><div className="profile-grid"><section className="profile-card"><span className="profile-big-avatar">{user.name.slice(0,1).toUpperCase()}</span><h2>{user.name}</h2><p>@{user.username}</p><div className="profile-info"><span><Mail size={16}/>{user.email}</span>{user.phone && <span><Phone size={16}/>{user.phone}</span>}</div><button className="secondary-btn" onClick={onLogout}><LogOut size={15}/> Sign out</button></section><section className="profile-stats"><div className="profile-stat"><CalendarDays/><strong>{bookings.length}</strong><span>Total bookings</span></div><div className="profile-stat"><UserRoundPlus/><strong>{invites.length}</strong><span>Player invites sent</span></div><div className="profile-stat"><Wallet/><strong>{money(bookings.reduce((s,b)=>s+b.total,0))}</strong><span>Demo booking value</span></div></section></div><div className="availability-note"><ShieldCheck size={16}/><span>Profile data is saved locally in your browser in this demo. Real account management will use the shared backend.</span></div></>
}
function PageHeader({ kicker, title, description }) { return <section className="page-heading"><div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div></section> }

export default App
