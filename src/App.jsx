import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, Bike, CalendarDays,
  CalendarRange, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, CreditCard, Filter, FileText,
  IndianRupee, LocateFixed, LogOut, MapPin, Menu, Minus, Plus, Search,
  ShieldCheck, SlidersHorizontal, Sparkles, Star, Ticket, Trophy, UserRound,
  UserRoundPlus, Users, Wallet, X, Zap, Mail, Phone, PhoneCall, Globe, LockKeyhole, Eye,
  CircleHelp, MapPinned, Medal, BellRing, Percent, Dumbbell, ClipboardList, Gamepad2, Mountain, Route, Images, Video, PersonStanding, ShoppingBag, ShoppingCart, Package, Truck, Trash2, ArrowDown, Download,
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { readDemo, writeDemo } from './services/demoStore'
import { backendRequest } from './services/backendClient'
import { demoPeople } from './data/demoPeople'
import { demoTournamentTemplates } from './data/demoTournaments'
import { fetchPublishedTurfs, mediaUrl } from './services/sharedContentApi'

const RATE_PER_HOUR = 800
const BOOKING_KEY = 'bookings'
const INVITE_KEY = 'playerInvites'
const SPORTS = ['All', 'Football', 'Cricket', 'Badminton', 'Running', 'Pickleball', 'Paintball', 'Boxing']
const SHOP_CATEGORIES = ['All gear', 'Cricket', 'Football', 'Badminton', 'Pickleball', 'Boxing', 'Training']
const SHOP_PRODUCTS = [
  { id: 'cricket-bat-pro', name: 'Pro Cricket Bat', category: 'Cricket', price: 2899, compareAt: 3499, badge: 'Bestseller', icon: Trophy, tone: 'bat', description: 'Practice and match-ready bat for club play.' , image: 'https://www.gray-nicolls.co.uk/cdn/shop/files/CAAB26EnglishWillowBatsLegendPLATINUMEdition_FaceRight.jpg?v=1760957000&width=1600'},
  { id: 'cricket-tennis-ball', name: 'Tennis Cricket Ball · 3 Pack', category: 'Cricket', price: 299, compareAt: 399, badge: 'Popular', icon: CircleHelp, tone: 'ball', description: 'Bright, durable balls for turf and street cricket.' , image: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Cw_1200%2Ch_630/NI_CATALOG/IMAGES/CIW/2026/6/29/35bb450e-27e5-4e42-98a7-c6ef7e6d61bc_12877.jpg'},
  { id: 'cricket-leather-ball', name: 'Leather Cricket Ball', category: 'Cricket', price: 549, compareAt: 699, badge: '', icon: CircleHelp, tone: 'leather', description: 'Practice-grade leather ball for net sessions.' , image: 'https://www.martinberrillsports.com/cdn/shop/products/MB_205_20_c_a91cdc73-5c35-4c06-94de-06f877c3b749_2904x2904.jpg?v=1612542116'},
  { id: 'cricket-stumps', name: 'Portable Cricket Stumps', category: 'Cricket', price: 649, compareAt: 799, badge: '', icon: Package, tone: 'stumps', description: 'Lightweight set for backyard and practice games.' , image: 'https://i.ebayimg.com/00/s/MTI4MFgxMjgw/z/SaIAAOSwcJVd5kZm/%24_57.JPG?set_id=8800005007'},
  { id: 'football-match-ball', name: 'Training Football', category: 'Football', price: 899, compareAt: 1199, badge: 'Popular', icon: Trophy, tone: 'football', description: 'All-round ball for turf and outdoor practice.' , image: 'https://contents.mediadecathlon.com/p3058727/a7f27ceb620736212f66b086690624a4/p3058727.jpg?f=3000x0&format=auto&quality=70'},
  { id: 'badminton-racket', name: 'Carbon Badminton Racket', category: 'Badminton', price: 1599, compareAt: 1999, badge: '', icon: Activity, tone: 'racket', description: 'Lightweight frame for regular court sessions.' , image: 'https://contents.mediadecathlon.com/p2817590/k%245e10f61639a2384e78dfdb53a17fbb6a/picture.jpg?f=3000x0&format=auto'},
  { id: 'shuttlecock-pack', name: 'Feather Shuttlecocks · 6 Pack', category: 'Badminton', price: 499, compareAt: 599, badge: '', icon: Activity, tone: 'shuttle', description: 'Practice pack for club and academy play.' , image: 'https://i.ebayimg.com/images/g/msgAAeSwAg9poMbb/s-l400.jpg'},
  { id: 'pickleball-paddle', name: 'Pickleball Paddle', category: 'Pickleball', price: 1299, compareAt: 1599, badge: 'New', icon: CircleHelp, tone: 'paddle', description: 'Comfort-grip paddle for beginner and regular play.' , image: 'https://pickleballnation.com/cdn/shop/files/gamma-micron-5-0-pickleball-paddle-FRONT_grande.jpg?v=1736125514'},
  { id: 'pickleball-balls', name: 'Outdoor Pickleballs · 3 Pack', category: 'Pickleball', price: 349, compareAt: 449, badge: '', icon: CircleHelp, tone: 'pickleball', description: 'Perforated outdoor balls for court sessions.' , image: 'https://thepickleparlour.com/cdn/shop/files/69aaa4be3aa59_1772790974.jpg?v=1775104293&width=1024'},
  { id: 'boxing-gloves', name: 'Training Boxing Gloves', category: 'Boxing', price: 1199, compareAt: 1499, badge: 'Popular', icon: Dumbbell, tone: 'gloves', description: 'Training gloves for bag work and fitness drills.' , image: 'https://www.everlast.com/cdn/shop/files/P00004050_Black_Back2-0318.jpg?v=1752075125&width=1920'},
  { id: 'skipping-rope', name: 'Speed Skipping Rope', category: 'Training', price: 299, compareAt: 399, badge: '', icon: Activity, tone: 'rope', description: 'Adjustable rope for warm-ups and conditioning.' , image: 'https://www.littleblokefitness.com.au/cdn/shop/files/1RMEliteSpeedRope-Black_3b5bb14c-ec32-4563-b60c-0160e05dcb9e.jpg?v=1714623493'},
  { id: 'training-cones', name: 'Agility Cones · 10 Pack', category: 'Training', price: 399, compareAt: 499, badge: '', icon: Zap, tone: 'cones', description: 'Set up footwork, sprint and coordination drills.' , image: 'https://i.ebayimg.com/images/g/JjIAAOSw379cZabJ/s-l400.jpg'}
]
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

function getVenueRoofInfo(venue) {
  const explicit = venue?.roofType ?? venue?.roofStatus ?? venue?.roofingType ?? venue?.coverageType ?? venue?.shelterType ?? venue?.roofing
  const isRoofed = venue?.isRoofed ?? venue?.roofed ?? venue?.isCovered
  const raw = String(explicit ?? '').trim().toLowerCase()
  let status = 'Not confirmed'
  if (isRoofed === true || /roofed|covered|indoor|enclosed/.test(raw)) status = 'Roofed'
  else if (isRoofed === false || /non.?roof|uncovered|^open$|open.?air|outdoor.?open/.test(raw)) status = 'Non-Roofed'
  const refundPercent = status === 'Non-Roofed' ? 50 : status === 'Roofed' ? 0 : null
  return {
    status,
    refundPercent,
    refundLabel: refundPercent === 50 ? '50% if rain makes the turf unplayable' : refundPercent === 0 ? '0% for rain alone' : 'Pending venue confirmation'
  }
}

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
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving&utm_source=sportiland&utm_campaign=venue_directions`
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
    registrationNote: 'Registration is handled by Audax India. SportiLand does not collect the entry fee or confirm a rider entry.',
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
  // Keep the local demo customer signed in across refreshes for frontend-only testing.
  const [user, setUser] = useState(() => readDemo('demoCustomerSession', null))
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const pendingAuthAction = useRef(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [page, setPage] = useState('discover')
  const pageHistoryRef = useRef([])
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
  const [bookingPass, setBookingPass] = useState(null)
  const [bookingFilter, setBookingFilter] = useState('All')
  const [toast, setToast] = useState('')
  const [playerVenueId, setPlayerVenueId] = useState('')
  const [playerSport, setPlayerSport] = useState('All')
  const [playerSearch, setPlayerSearch] = useState('')
  const [invites, setInvites] = useState(() => readDemo(INVITE_KEY, []))
  const [tournamentSport, setTournamentSport] = useState('All')
  const [tournamentRegistrations, setTournamentRegistrations] = useState(() => readDemo('tournamentRegistrations', []))
  const [adventureRegistrations, setAdventureRegistrations] = useState(() => readDemo('adventureRegistrations', []))
  const [shopCart, setShopCart] = useState(() => readDemo('shopCart', []))
  const [shopOrders, setShopOrders] = useState(() => readDemo('shopOrders', []))
  const [shopCheckoutOpen, setShopCheckoutOpen] = useState(false)
  const [publishedTurfs, setPublishedTurfs] = useState([])
  const [announcementTarget, setAnnouncementTarget] = useState(null)
  const baseVenuesRef = useRef([])
  const publishedTurfsRef = useRef([])
  const adventureEvents = useMemo(() => buildAdventureEvents(), [])

  // Browsing is public. Restore a server-authenticated customer only when a valid
  // HttpOnly SportiLand session cookie already exists.
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
  useEffect(() => writeDemo('shopCart', shopCart), [shopCart])
  useEffect(() => writeDemo('shopOrders', shopOrders), [shopOrders])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer) }, [toast])
  useEffect(() => {
    const openTerms = () => {
      pageHistoryRef.current.push(page)
      setSelectedVenue(null)
      setCheckout(false)
      setPage('terms')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('sportiland:open-terms', openTerms)
    return () => window.removeEventListener('sportiland:open-terms', openTerms)
  }, [page])
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
        if (!entry.isIntersecting) return
        entry.target.classList.add('exp-revealed')
        observer.unobserve(entry.target)
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
  function continueAsDemoCustomer() {
    const demoAccount = {
      id: 'sportiland-demo-customer',
      role: 'CUSTOMER',
      username: 'demo_customer',
      name: 'Demo Customer',
      email: 'demo.customer@sportiland.local',
      demo: true
    }
    writeDemo('demoCustomerSession', demoAccount)
    setUser(demoAccount)
    setAuthModalOpen(false)
    setAuthForm({ username: '', email: '', password: '' })
    setAuthError('')
    const continueAction = pendingAuthAction.current
    pendingAuthAction.current = null
    if (continueAction) continueAction(demoAccount)
    notify('Demo customer signed in. You can now complete a test booking and open its QR pass.')
  }

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
      if (!account || account.role !== 'CUSTOMER') throw new Error('A valid customer account was not returned by SportiLand.')
      setUser(account)
      setAuthModalOpen(false)
      setAuthForm({ username: '', email: '', password: '' })
      setAuthNotice('')
      notify(authMode === 'register' ? 'Customer account created successfully.' : `Welcome back, ${account.name || account.username}!`)
      const continueAction = pendingAuthAction.current
      pendingAuthAction.current = null
      if (continueAction) continueAction(account)
    } catch (error) {
      setAuthError(error.message || 'Unable to complete authentication. Check that the SportiLand backend is running.')
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
    writeDemo('demoCustomerSession', null)
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
    const roofInfo = getVenueRoofInfo(selectedVenue)
    const booking = {
      id: `FF-${String(Date.now()).slice(-7)}`, customerId: user.id, customerName: user.name,
      venueId: selectedVenue.id, venueName: selectedVenue.name, area: selectedVenue.area,
      sport: (selectedVenue.sports || ['Football'])[0], date: bookingDate, time: selectedTime,
      duration, ratePerHour: RATE_PER_HOUR, subtotal: price.subtotal, discountCode: appliedCoupon || '',
      discount: price.discount, total: price.total, paymentMethod,
      paymentStatus: paymentMethod === 'Pay at venue (demo)' ? 'Pending' : 'Demo payment complete',
      status: 'Awaiting owner confirmation', createdAt: new Date().toISOString(),
      roofStatus: roofInfo.status, rainRefundPercent: roofInfo.refundPercent, rainRefundLabel: roofInfo.refundLabel,
      qrToken: createBookingPassToken()
    }
    setBookings(prev => [booking, ...prev])
    setBookingPass(booking)
    setCheckout(false); setSelectedVenue(null); setSelectedTime(''); setPage('bookings')
    notify('Demo booking request created. Your QR booking pass is ready to view.')
  }
  function openBookingPass(booking) {
    const next = booking.qrToken ? booking : { ...booking, qrToken: createBookingPassToken() }
    if (!booking.qrToken) setBookings(previous => previous.map(item => item.id === booking.id ? next : item))
    setBookingPass(next)
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

  function addShopItem(product) {
    setShopCart(previous => {
      const found = previous.find(item => item.productId === product.id)
      return found
        ? previous.map(item => item.productId === product.id ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item)
        : [...previous, { productId: product.id, quantity: 1 }]
    })
    notify(`${product.name} added to your demo cart.`)
  }
  function updateShopQuantity(productId, delta) {
    setShopCart(previous => previous
      .map(item => item.productId === productId ? { ...item, quantity: Math.min(20, Math.max(0, item.quantity + delta)) } : item)
      .filter(item => item.quantity > 0))
  }
  function removeShopItem(productId) {
    setShopCart(previous => previous.filter(item => item.productId !== productId))
  }
  function beginShopCheckout() {
    if (!shopCart.length) { notify('Add at least one item before checkout.'); return }
    openCustomerAuth(() => setShopCheckoutOpen(true), 'Sign in or create a customer account to continue with your shop order.')
  }
  function completeShopOrder(details) {
    if (!user || !shopCart.length) return
    const items = shopCart.map(item => {
      const product = SHOP_PRODUCTS.find(product => product.id === item.productId)
      return { productId: item.productId, name: product?.name || 'SportiLand item', quantity: item.quantity, unitPrice: product?.price || 0, lineTotal: (product?.price || 0) * item.quantity }
    })
    const order = {
      id: `FF-SH-${String(Date.now()).slice(-8)}`, customerId: user.id, customerName: user.name || user.username,
      items, subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
      shipping: 0, total: items.reduce((sum, item) => sum + item.lineTotal, 0),
      ...details, status: 'Demo order saved · awaiting backend integration', createdAt: new Date().toISOString()
    }
    setShopOrders(previous => [order, ...previous])
    setShopCart([])
    setShopCheckoutOpen(false)
    notify(`Demo order ${order.id} saved. No payment or delivery has been processed.`)
  }

  function navigateFromAnnouncement(item) {
    // Change the destination first, then let the new page mount before scrolling.
    // This avoids trying to scroll to an event card that is not in the DOM yet.
    if (item.page === 'discover' && item.sport) {
      setSport(item.sport)
      setArea('All areas')
    }
    if (item.page === 'tournaments') setTournamentSport('All')
    setAnnouncementTarget({ ...item, nonce: Date.now() })
    if (item.page !== page) pageHistoryRef.current.push(page)
    setPage(item.page)
    setMobileNav(false)
    setSportsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (item.page === 'discover' && item.sport) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }))
    }
  }

  const nav = [
    { id: 'discover', label: 'Home', icon: Search },
    { id: 'bookings', label: 'My bookings', icon: CalendarDays },
    { id: 'players', label: 'Find players', icon: Users },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'events', label: 'Events & adventures', icon: Route },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'profile', label: 'My profile', icon: UserRound },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText }
  ]

  function navigateBack() {
    const previousPage = pageHistoryRef.current.pop() || 'discover'
    setPage(previousPage)
    setMobileNav(false)
    setSportsMenuOpen(false)
    setAnnouncementTarget(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigatePage(id) {
    const go = () => {
      if (id !== page) pageHistoryRef.current.push(page)
      setPage(id)
      setMobileNav(false)
      setSportsMenuOpen(false)
      setAnnouncementTarget(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (id === 'bookings' || id === 'profile') {
      openCustomerAuth(go, 'Sign in or create a customer account to view your personal SportiLand activity.')
    } else go()
  }
  function chooseExperimentSport(item) {
    setSport(item)
    setArea('All areas')
    if (page !== 'discover') pageHistoryRef.current.push(page)
    setPage('discover')
    setSportsMenuOpen(false)
    setMobileNav(false)
    window.setTimeout(() => document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  return <div className="customer-shell experiment-shell">
    <div className="experiment-scroll-progress" aria-hidden="true"/>
    <header className="experiment-topbar">
      <button className="experiment-brand" type="button" onClick={() => navigatePage('discover')} aria-label="SportiLand home">
        <span className="brand-mark"><Trophy size={22}/></span>
        <span className="experiment-brand-copy">SportiLand<span className="brand-dot">.</span><small>PLAY MORE. PLAN LESS.</small></span>
      </button>
      <div className="experiment-page-controls" aria-label="Page navigation">
        <button className="experiment-page-control" type="button" onClick={navigateBack} disabled={pageHistoryRef.current.length === 0} aria-label="Go back" title="Go back"><ChevronLeft size={16}/><span>Back</span></button>
      </div>
      <nav className="experiment-nav" aria-label="Main navigation">
        <button className={`experiment-nav-link ${page === 'discover' ? 'active' : ''}`} onClick={() => navigatePage('discover')}>Home</button>
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
        <button className={`experiment-nav-link ${page === 'shop' ? 'active' : ''}`} onClick={() => navigatePage('shop')}>Shop <ShoppingBag size={14}/>{shopCart.reduce((sum, item) => sum + item.quantity, 0) > 0 && <b className="shop-nav-count">{shopCart.reduce((sum, item) => sum + item.quantity, 0)}</b>}</button>
      </nav>
      <div className="experiment-top-actions">
        <button className="experiment-search-shortcut" type="button" onClick={() => { if (page !== 'discover') navigatePage('discover'); window.setTimeout(() => document.getElementById('venue-search')?.focus(), 80) }}><Search size={16}/><span>Search venues</span><kbd>/</kbd></button>
        {user ? <div className="dropdown customer-account-dropdown experiment-account"><button className="profile-mini dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span className="avatar">{(user.name || user.username || 'C').slice(0,1).toUpperCase()}</span><strong>{user.name || user.username}</strong></button><ul className="dropdown-menu dropdown-menu-end"><li><button className="dropdown-item" type="button" onClick={() => navigatePage('profile')}>My profile</button></li><li><button className="dropdown-item" type="button" onClick={() => navigatePage('bookings')}>My bookings</button></li><li><button className="dropdown-item" type="button" onClick={() => navigatePage('terms')}>Terms &amp; Conditions</button></li><li><hr className="dropdown-divider"/></li><li><button className="dropdown-item text-danger" type="button" onClick={logout}>Sign out</button></li></ul></div> : <><span className="guest-status">Browsing as guest</span><button className="guest-signin-btn" type="button" onClick={() => openCustomerAuth()}>Sign in</button></>}
        <button className="experiment-mobile-toggle" type="button" aria-label={mobileNav ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNav} onClick={() => setMobileNav(value => !value)}>{mobileNav ? <X size={21}/> : <Menu size={21}/>}</button>
      </div>
    </header>
    {mobileNav && <div className="experiment-mobile-panel">
      <div className="experiment-mobile-caption">EXPLORE SportiLand</div>
      {[{id:'discover',label:'Home'},{id:'events',label:'Events & adventures'},{id:'tournaments',label:'Tournaments'},{id:'players',label:'Find players'},{id:'shop',label:'Shop'},{id:'bookings',label:'My bookings'},{id:'profile',label:'My profile'},{id:'terms',label:'Terms & Conditions'}].map(item => <button key={item.id} type="button" onClick={() => navigatePage(item.id)}>{item.label}<ArrowUpRight size={16}/></button>)}
      <div className="experiment-mobile-caption">SPORTS</div>
      <div className="experiment-mobile-sports">{SPORTS.slice(1).map(item => <button key={item} type="button" onClick={() => chooseExperimentSport(item)}>{item}</button>)}</div>
    </div>}
    <main className="experiment-main">
      {page !== 'discover' && <div className="experiment-breadcrumb"><button onClick={() => navigatePage('discover')}>SportiLand</button><span>/</span><strong>{nav.find(n => n.id === page)?.label}</strong></div>}
      {page === 'discover' && <DiscoverPage venues={filteredVenues} total={venues.length} search={search} setSearch={setSearch} sport={sport} setSport={setSport} areas={areas} area={area} setArea={setArea} onOpen={openVenue} onGoPlayers={() => navigatePage('players')} adventureEvents={adventureEvents} onNavigateAnnouncement={navigateFromAnnouncement} onGoPage={navigatePage} />}
      {page === 'bookings' && user && <BookingsPage bookings={filteredBookings} filter={bookingFilter} setFilter={setBookingFilter} onCancel={cancelBooking} onOpenPass={openBookingPass} />}
      {page === 'players' && <PlayersPage venues={venues} selectedVenueId={playerVenueId} setSelectedVenueId={setPlayerVenueId} sport={playerSport} setSport={setPlayerSport} search={playerSearch} setSearch={setPlayerSearch} invited={myInviteIds} onInvite={sendInvite} />}
      {page === 'tournaments' && <TournamentsPage events={tournaments} sport={tournamentSport} setSport={setTournamentSport} registrations={tournamentRegistrations.filter(r => r.customerId === user?.id)} onRegister={registerTournament} onRequireAuth={openCustomerAuth} focusAnnouncement={announcementTarget?.page === 'tournaments' ? announcementTarget : null} />}
      {page === 'events' && <AdventureEventsPage events={adventureEvents} focusAnnouncement={announcementTarget?.page === 'events' ? announcementTarget : null} />}
      {page === 'shop' && <ShopPage products={SHOP_PRODUCTS} cart={shopCart} onAdd={addShopItem} onQuantity={updateShopQuantity} onRemove={removeShopItem} onCheckout={beginShopCheckout} onContinueShopping={() => navigatePage('discover')} orders={shopOrders.filter(order => order.customerId === user?.id)} />}
      {page === 'terms' && <TermsConditionsPage />}
      {page === 'profile' && user && <ProfilePage user={user} bookings={customerBookings} invites={invites.filter(i => i.customerId === user.id)} onLogout={logout} />}
    </main>
    <footer className="experiment-footer"><div className="experiment-footer-brand"><span className="brand-mark"><Trophy size={20}/></span><strong>SportiLand<span>.</span></strong></div><p>Find your place to play. Meet your team. Make time for the game.</p><div className="experiment-footer-links"><button onClick={() => navigatePage('discover')}>Home</button><button onClick={() => navigatePage('events')}>Events</button><button onClick={() => navigatePage('tournaments')}>Tournaments</button><button onClick={() => navigatePage('players')}>Find players</button><button onClick={() => navigatePage('shop')}>Shop</button><button onClick={() => navigatePage('terms')}>Terms & Conditions</button></div><small>© 2026 SportiLand · Madurai region</small></footer>
    {selectedVenue && <BookingModal venue={selectedVenue} onFindPlayers={() => { setPlayerVenueId(selectedVenue.id); setPlayerSport((selectedVenue.sports || ['All'])[0]); setSelectedVenue(null); navigatePage('players') }} date={bookingDate} setDate={value => { setBookingDate(value); setSelectedTime(''); setAppliedCoupon(null); setCouponError('') }} duration={duration} setDuration={value => { setDuration(value); setAppliedCoupon(null); setCouponError('') }} selectedTime={selectedTime} setSelectedTime={setSelectedTime} slots={slotOptions(selectedVenue, bookingDate, duration)} coupon={coupon} setCoupon={setCoupon} appliedCoupon={appliedCoupon} couponError={couponError} applyCoupon={applyCoupon} price={getPrice()} onClose={() => { setSelectedVenue(null); setCheckout(false) }} onContinue={startBooking} />}
    {bookingPass && <BookingPassModal booking={bookingPass} onClose={() => setBookingPass(null)} />}
    {checkout && selectedVenue && <CheckoutModal venue={selectedVenue} date={bookingDate} time={selectedTime} duration={duration} price={getPrice()} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onBack={() => setCheckout(false)} onConfirm={completeBooking} />}
    {shopCheckoutOpen && <ShopCheckoutModal cart={shopCart} products={SHOP_PRODUCTS} user={user} onClose={() => setShopCheckoutOpen(false)} onConfirm={completeShopOrder} />}
    {authModalOpen && <CustomerAuthModal mode={authMode} setMode={mode => { setAuthMode(mode); setAuthError(''); setAuthNotice('') }} form={authForm} update={updateAuth} onSubmit={submitAuth} onDemo={continueAsDemoCustomer} error={authError} notice={authNotice} onClose={() => { setAuthModalOpen(false); pendingAuthAction.current = null }} />}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    <div className="demo-ribbon"><ShieldCheck size={13}/> EXPERIMENTAL CUSTOMER EXPERIENCE · DEMO BOOKINGS & PAYMENTS · Owner-published media sync when the backend is running</div>
  </div>
}

function HomeAnnouncementMarquee({ adventureEvents, onNavigate }) {
  const trackRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return undefined

    const cards = Array.from(track.querySelectorAll('[data-stack-card]'))
    if (!cards.length) return undefined

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    let frame = 0
    let trackTop = 0
    let trackHeight = 1
    let stageHeight = 1
    let stickyTop = 112
    let travel = 1
    let lastActiveStep = -1

    const setStyle = (node, property, value) => {
      if (node.style[property] !== value) node.style[property] = value
    }
    const setCssVar = (node, property, value) => {
      if (node.style.getPropertyValue(property) !== value) node.style.setProperty(property, value)
    }
    const setAccess = (card, enabled) => {
      const next = enabled ? '1' : '0'
      if (card.dataset.stackAccess !== next) {
        card.dataset.stackAccess = next
        card.style.pointerEvents = enabled ? 'auto' : 'none'
        card.tabIndex = enabled ? 0 : -1
        card.setAttribute('aria-hidden', enabled ? 'false' : 'true')
      }
    }
    const measure = () => {
      const rect = track.getBoundingClientRect()
      trackTop = rect.top + window.scrollY
      trackHeight = track.offsetHeight || 1
      stageHeight = stage.offsetHeight || 1
      stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 112
      travel = Math.max(1, trackHeight - stageHeight)
    }
    const setImageWindow = activeStep => {
      // Only keep the current card, the outgoing card and the next four images
      // attached. The stack uses overlapping cards, so native lazy-loading alone
      // treats every image as near-viewport and can decode the entire gallery.
      const loadFrom = Math.max(0, activeStep - 1)
      const loadTo = Math.min(cards.length - 1, activeStep + 4)
      cards.forEach((card, index) => {
        const img = card.querySelector('[data-stack-src]')
        if (!img) return
        const shouldLoad = index >= loadFrom && index <= loadTo
        const currentSrc = img.getAttribute('src')
        if (shouldLoad && !currentSrc) img.setAttribute('src', img.dataset.stackSrc)
        else if (!shouldLoad && currentSrc) img.removeAttribute('src')
      })
    }

    const updateStack = () => {
      frame = 0
      if (reduceMotion) {
        cards.forEach((card, index) => {
          const img = card.querySelector('[data-stack-src]')
          if (img && !img.getAttribute('src')) img.setAttribute('src', img.dataset.stackSrc)
          setStyle(card, 'opacity', '1')
          setStyle(card, 'transform', 'none')
          setStyle(card, 'zIndex', String(cards.length - index))
          card.classList.remove('is-stack-moving')
          setAccess(card, true)
        })
        setCssVar(track, '--stack-progress', '0')
        return
      }

      // Read cached geometry and the scroll position only; no layout reads inside
      // the per-card loop. Scroll updates are already coalesced to one RAF.
      const progress = Math.min(1, Math.max(0, (window.scrollY + stickyTop - trackTop) / travel))
      const position = progress * Math.max(0, cards.length - 1)
      const activeStep = Math.floor(position)
      if (activeStep !== lastActiveStep) {
        lastActiveStep = activeStep
        setImageWindow(activeStep)
      }

      cards.forEach((card, index) => {
        const relative = index - position
        let y = 0
        let scale = 1
        let rotation = 0
        let opacity = 1
        let zIndex

        if (relative < -0.42) {
          const distance = Math.min(1.5, Math.abs(relative) - 0.42)
          y = -74 - distance * 118
          scale = 0.96 - distance * 0.1
          rotation = -1.2 - distance * 1.3
          opacity = Math.max(0, 1 - distance * 1.7)
          zIndex = 1 + index
        } else {
          const depth = Math.max(0, relative)
          y = Math.min(76, depth * 19)
          scale = 1 - Math.min(0.13, depth * 0.034)
          rotation = Math.min(2.2, depth * 0.62)
          opacity = depth > 3 ? Math.max(0, 1 - (depth - 3) * 1.45) : 1
          zIndex = 100 - index
        }

        // Round values to avoid tiny sub-pixel style mutations on every frame.
        const transform = `translate3d(0,${y.toFixed(1)}px,0) scale(${scale.toFixed(3)}) rotate(${rotation.toFixed(2)}deg)`
        setStyle(card, 'transform', transform)
        setStyle(card, 'opacity', opacity.toFixed(3))

        // Accessibility, hit-testing and stacking order only change when a card
        // crosses a threshold, not on every scroll frame.
        const layer = relative < -0.42 ? 'outgoing' : 'front'
        if (card.dataset.stackLayer !== layer) {
          card.dataset.stackLayer = layer
          setStyle(card, 'zIndex', String(zIndex))
        }
        setAccess(card, opacity > 0.35)

        const shouldPromote = Math.abs(relative) < 3.5 && opacity > 0.01
        if (card.classList.contains('is-stack-moving') !== shouldPromote) {
          card.classList.toggle('is-stack-moving', shouldPromote)
        }
      })

      setCssVar(track, '--stack-progress', progress.toFixed(4))
      setCssVar(track, '--stack-active-index', String(Math.min(cards.length, activeStep + 1)))
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateStack)
    }
    const onResize = () => {
      measure()
      requestUpdate()
    }

    measure()
    updateStack()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null
    resizeObserver?.observe(track)
    resizeObserver?.observe(stage)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      resizeObserver?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [adventureEvents.length])

  return <section className="experiment-event-stack" aria-label="Events and adventures around Madurai">
    <div className="experiment-event-stack-intro">
      <span className="section-kicker">LOCAL PLAY · LOCAL ADVENTURES</span>
      <h2>Make your next day<br/><em>one to remember.</em></h2>
      <p>Scroll through upcoming rides and outdoor experiences. Each card opens its full event listing, details and official registration link.</p>
      <button className="primary-btn" type="button" onClick={() => onNavigate({ page: 'events' })}>Explore all events <ArrowUpRight size={16}/></button>
      <div className="experiment-stack-instruction"><span className="experiment-stack-mouse"><i/></span><span><strong>Scroll to explore</strong><small>{String(adventureEvents.length).padStart(2, '0')} experiences in the stack</small></span></div>
    </div>

    <div className="experiment-stack-track" ref={trackRef} style={{ '--stack-count': adventureEvents.length, '--stack-height': `${adventureEvents.length * 42 + 42}vh`, '--stack-height-tablet': `${adventureEvents.length * 37 + 38}vh`, '--stack-height-mobile': `${adventureEvents.length * 34 + 35}vh` }}>
      <div className="experiment-stack-stage" ref={stageRef}>
        {adventureEvents.map((event, index) => {
          const EventIcon = event.kind === 'Cycling' ? Bike : event.kind === 'Marathon' ? PersonStanding : event.kind === 'Tournament' ? Trophy : Mountain
          return <button
            className="experiment-stack-card"
            data-stack-card
            type="button"
            key={event.id}
            style={{ '--stack-index': index }}
            onClick={() => onNavigate({ page: 'events', id: event.id, title: event.title })}
            aria-label={`Open ${event.title} in Events and adventures`}
          >
            <img className="experiment-stack-photo" src={index < 4 ? event.image : undefined} data-stack-src={event.image} alt={`${event.title} event`} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" />
            <span className="experiment-stack-shade" aria-hidden="true"/>
            <span className="experiment-stack-card-top"><span><EventIcon size={14}/>{event.kind}</span><b>{String(index + 1).padStart(2, '0')} <i>/ {String(adventureEvents.length).padStart(2, '0')}</i></b></span>
            <span className="experiment-stack-card-copy">
              <small>{event.organiser || 'SportiLand · LOCAL EXPERIENCE'}</small>
              <strong>{event.title}</strong>
              <span className="experiment-stack-card-meta"><span><CalendarDays size={14}/>{event.dateLabel || (event.date ? prettyDate(event.date) : 'Date to be selected')}</span><span><MapPin size={14}/>{event.location}</span></span>
              <span className="experiment-stack-card-action">View event details <ArrowUpRight size={16}/></span>
            </span>
          </button>
        })}
      </div>
      <div className="experiment-stack-progress" aria-hidden="true"><span/></div>
    </div>
  </section>
}

function AdventureEventsPage({ events, focusAnnouncement }) {
  useEffect(() => {
    if (!focusAnnouncement?.id) return undefined
    let firstFrame = 0
    let secondFrame = 0
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const target = document.querySelector(`[data-event-id="${focusAnnouncement.id}"]`)
        if (!target) return
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
        target.classList.add('announcement-focus')
        window.setTimeout(() => target.classList.remove('announcement-focus'), 1800)
      })
    })
    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
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


function ShopPage({ products, cart, onAdd, onQuantity, onRemove, onCheckout, onContinueShopping, orders }) {
  const [category, setCategory] = useState('All gear')
  const [query, setQuery] = useState('')
  const filtered = products.filter(product => {
    const categoryMatch = category === 'All gear' || product.category === category
    const queryMatch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase())
    return categoryMatch && queryMatch
  })
  const cartItems = cart.map(item => ({ ...item, product: products.find(product => product.id === item.productId) })).filter(item => item.product)
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  return <div className="shop-page">
    <div className="shop-hero" data-exp-reveal>
      <div><span className="section-kicker">SportiLand SHOP · GAME DAY ESSENTIALS</span><h1>Gear up for<br/><em>your next game.</em></h1><p>Shop the everyday essentials for turf, court, training and outdoor play.</p><div className="shop-benefits"><span><Truck size={15}/> Demo delivery preview</span><span><ShieldCheck size={15}/> Secure checkout planned</span><span><Package size={15}/> Curated sports essentials</span></div></div>
      <div className="shop-hero-art"><span className="shop-hero-orbit"/><div className="shop-hero-product"><ShoppingBag size={68}/><small>PLAY MORE · SHOP SMART</small></div><b className="shop-hero-sticker">READY<br/>SET<br/>PLAY</b></div>
    </div>
    <div className="shop-heading-row"><div><span className="section-kicker">THE EQUIPMENT SHELF</span><h2>Find your game-day gear.</h2><p>Demo catalogue · sample products and prices for the frontend prototype.</p></div><span className="shop-cart-count"><ShoppingCart size={16}/>{count} items in cart</span></div>
    <div className="shop-layout">
      <div className="shop-catalog">
        <div className="shop-tools"><div className="search-field"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search bats, balls, rackets and more"/><button type="button" aria-label="Clear product search" onClick={() => setQuery('')}><X size={15}/></button></div><div className="shop-category-filters">{SHOP_CATEGORIES.map(item => <button type="button" className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="shop-product-grid">{filtered.map(product => {
          const Icon = product.icon
          const inCart = cart.find(item => item.productId === product.id)?.quantity || 0
          return <article className="shop-product-card" key={product.id}>
            <div className={`shop-product-art tone-${product.tone}`}><span className="shop-product-badge">{product.badge || product.category}</span><img className="shop-product-photo" src={product.image} alt={product.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.classList.add("image-failed") }}/><Icon size={56} strokeWidth={1.55}/><small>SportiLand</small></div>
            <div className="shop-product-info"><span className="shop-product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="shop-product-price"><strong>{money(product.price)}</strong><del>{money(product.compareAt)}</del><small>Demo price</small></div><button type="button" className={`primary-btn shop-add-btn ${inCart ? 'added' : ''}`} onClick={() => onAdd(product)}>{inCart ? <><Check size={15}/> Add one more · {inCart}</> : <><Plus size={16}/> Add to cart</>}</button></div>
          </article>
        })}{!filtered.length && <div className="shop-empty"><Package size={28}/><strong>No matching gear</strong><p>Try a different search or category.</p><button className="secondary-btn" onClick={() => { setCategory('All gear'); setQuery('') }}>Clear filters</button></div>}</div>
      </div>
      <aside className="shop-cart-panel">
        <div className="shop-cart-heading"><div><span className="section-kicker">YOUR SELECTION</span><h3>Shopping cart</h3></div><span>{count}</span></div>
        {cartItems.length ? <div className="shop-cart-items">{cartItems.map(item => <div className="shop-cart-item" key={item.productId}><div className={`shop-cart-thumb tone-${item.product.tone}`}><img src={item.product.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = "none" }}/><item.product.icon size={21}/></div><div className="shop-cart-item-copy"><strong>{item.product.name}</strong><small>{money(item.product.price)} each</small><div className="shop-quantity-control"><button type="button" onClick={() => onQuantity(item.productId, -1)} aria-label={`Decrease ${item.product.name}`}><Minus size={13}/></button><b>{item.quantity}</b><button type="button" onClick={() => onQuantity(item.productId, 1)} aria-label={`Increase ${item.product.name}`}><Plus size={13}/></button></div></div><div className="shop-cart-item-total"><strong>{money(item.product.price * item.quantity)}</strong><button type="button" onClick={() => onRemove(item.productId)} aria-label={`Remove ${item.product.name}`}><Trash2 size={14}/></button></div></div>)}</div> : <div className="shop-cart-empty"><ShoppingCart size={30}/><strong>Your cart is waiting.</strong><p>Add a few game-day essentials to see them here.</p></div>}
        <div className="shop-cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>Calculated later</strong></div><div className="shop-cart-total"><span>Estimated total</span><strong>{money(subtotal)}</strong></div><button type="button" className="primary-btn full" disabled={!cartItems.length} onClick={onCheckout}>Continue to checkout <ArrowRight size={16}/></button><small><ShieldCheck size={13}/> Demo checkout only. No payment or shipment is processed.</small></div>
      </aside>
    </div>
    {orders.length > 0 && <section className="shop-recent-orders"><div><span className="section-kicker">YOUR DEMO ACTIVITY</span><h3>Recent shop orders</h3></div>{orders.slice(0,3).map(order => <div className="shop-order-row" key={order.id}><span><strong>{order.id}</strong><small>{order.items.length} product types · {new Date(order.createdAt).toLocaleDateString('en-IN')}</small></span><b>{money(order.total)}</b><em>{order.status}</em></div>)}</section>}
    <div className="shop-demo-note"><ShieldCheck size={16}/><span><strong>Prototype storefront.</strong> Product catalogue, prices, cart and order confirmation are demo data saved in this browser. Inventory, shipping, tax calculation, payment gateway and order fulfilment must be connected to the backend before real sales.</span></div>
  </div>
}

function ShopCheckoutModal({ cart, products, user, onClose, onConfirm }) {
  const [form, setForm] = useState({ name: user?.name || user?.username || '', phone: '', address: '', city: 'Madurai', pincode: '' })
  const [payment, setPayment] = useState('Cash on delivery (demo)')
  const [error, setError] = useState('')
  const items = cart.map(item => ({ ...item, product: products.find(product => product.id === item.productId) })).filter(item => item.product)
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }))
  const submit = event => {
    event.preventDefault()
    if (!form.name.trim() || !/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim()) || form.address.trim().length < 8 || !/^\d{6}$/.test(form.pincode.trim())) {
      setError('Enter your name, valid mobile number, full address and 6-digit PIN code.')
      return
    }
    onConfirm({ ...form, name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), city: form.city.trim(), pincode: form.pincode.trim(), paymentMethod: payment })
  }
  return <div className="modal-backdrop shop-checkout-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="shop-checkout-modal" role="dialog" aria-modal="true" aria-label="Shop checkout"><div className="shop-checkout-head"><div><span className="section-kicker">SportiLand SHOP</span><h2>Delivery details</h2><p>Signed in as {user?.name || user?.username}</p></div><button type="button" className="modal-close" onClick={onClose}><X size={18}/></button></div><form onSubmit={submit}><div className="shop-checkout-grid"><label><span>Full name *</span><input value={form.name} onChange={event => update('name', event.target.value)} required maxLength={80}/></label><label><span>Mobile number *</span><input type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} required maxLength={16}/></label><label className="wide"><span>Delivery address *</span><textarea rows="3" value={form.address} onChange={event => update('address', event.target.value)} required maxLength={300}/></label><label><span>City</span><input value={form.city} onChange={event => update('city', event.target.value)} maxLength={50}/></label><label><span>PIN code *</span><input value={form.pincode} onChange={event => update('pincode', event.target.value.replace(/\D/g, '').slice(0,6))} inputMode="numeric" required maxLength={6}/></label></div><label className="shop-payment-choice"><span>Payment preference</span><select value={payment} onChange={event => setPayment(event.target.value)}><option>Cash on delivery (demo)</option><option>UPI payment (demo only)</option></select></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="shop-checkout-summary"><span>{items.reduce((sum,item)=>sum+item.quantity,0)} items · Demo total</span><strong>{money(total)}</strong></div><div className="shop-checkout-actions"><button type="button" className="secondary-btn" onClick={onClose}>Back to cart</button><button type="submit" className="primary-btn">Place demo order <ArrowRight size={16}/></button></div><small className="shop-checkout-disclaimer">This prototype stores a local order record only. No money is charged and no shipment is created.</small></form></section></div>
}

function TermsConditionsPage() {
  return <div className="terms-page" id="terms-and-conditions">
    <PageHeader kicker="CUSTOMER POLICIES" title="Terms & Conditions" description="Please review the rain and weather refund rules before confirming a booking."/>
    <article className="terms-policy-card">
      <span className="section-kicker">SPORTILAND · BOOKING POLICY</span>
      <h2>Rain & Weather Refund Policy</h2>
      <p>At SportiLand, we understand that weather conditions can sometimes affect scheduled sports activities. To ensure fairness for both customers and turf owners, the following refund policy applies to bookings affected by rainfall.</p>
      <section><h3>1. Non-Roofed Turfs</h3><ul><li>If it rains during the scheduled booking and the non-roofed turf becomes unsuitable for playing, the customer will be eligible for a <strong>50% refund of the booking amount</strong>.</li><li>The remaining 50% will be retained to cover operational costs and the reservation of the facility.</li><li>Refund eligibility applies only when rainfall genuinely affects the usability of the turf.</li></ul></section>
      <section><h3>2. Roofed / Covered Turfs</h3><ul><li>Bookings made at roofed or covered turfs are <strong>not eligible for a rain-related refund</strong>.</li><li>Since these facilities provide protection from rainfall, bookings will remain valid even during rainy weather.</li><li>Customers are expected to proceed with their scheduled booking unless the turf owner declares the facility unsafe or unavailable.</li></ul></section>
      <section><h3>3. Rain Before the Booking Time</h3><ul><li>If rain occurs before the scheduled booking, the turf owner will assess the ground conditions.</li><li>If a non-roofed turf is declared unsuitable for playing, the customer will be eligible for a 50% refund.</li><li>If the turf remains playable, the booking will proceed as scheduled.</li></ul></section>
      <section><h3>4. Rain During the Booking</h3><ul><li>If rainfall begins during an active booking and makes a non-roofed turf unplayable, the customer will be eligible for a 50% refund of the total booking amount.</li><li>If the rain does not affect the playing conditions, no refund will be applicable.</li></ul></section>
      <section><h3>5. Refund Processing</h3><ul><li>Eligible refunds will be processed through the original payment method wherever possible.</li><li>Refund processing time may vary depending on the payment provider or bank.</li><li>Customers may be required to contact customer support or the turf owner to initiate a refund request.</li></ul></section>
      <section><h3>6. Verification and Final Decision</h3><ul><li>Rain-related refund claims must be verified by the respective turf owner or SportiLand administration.</li><li>Refunds will only be approved when weather conditions genuinely prevent the customer from using the facility.</li><li>SportiLand reserves the right to review and resolve refund disputes based on the booking details and confirmation from the turf owner.</li></ul></section>
      <section><h3>7. Customer Agreement</h3><p>By completing a booking on SportiLand, customers acknowledge and agree to this Rain & Weather Refund Policy.</p></section>
      <aside className="terms-important"><strong>Important:</strong> A 50% refund applies to eligible rain-affected bookings at non-roofed turfs only. Roofed or covered turf bookings are not eligible for refunds solely due to rainfall.</aside>
      <p className="terms-policy-footnote">Venue roofing information is shown in booking details. Where the roof type has not been confirmed by the venue, SportiLand displays “Not confirmed” and the rain-refund percentage remains pending confirmation.</p>
    </article>
  </div>
}

function CustomerAuthModal({ mode, setMode, form, update, onSubmit, onDemo, error, notice, onClose }) {
  return <div className="auth-gate-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="auth-gate-card" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title">
      <button className="auth-gate-close" type="button" onClick={onClose} aria-label="Continue browsing as guest"><X size={19}/></button>
      <div className="auth-gate-brand"><span className="brand-mark"><Trophy size={20}/></span><strong>SportiLand<span>.</span></strong></div>
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
      <div className="auth-demo-divider"><span>OR</span></div>
      <button type="button" className="auth-demo-continue" onClick={onDemo}><Sparkles size={16}/><span><strong>Continue as demo customer</strong><small>No account or backend required</small></span><ArrowRight size={17}/></button>
      <div className="auth-gate-footnote"><ShieldCheck size={15}/><span>Accounts are checked and stored by the SportiLand backend. Email / SMS OTP verification is not enabled yet, so use an email address you control.</span></div>
      <button type="button" className="auth-guest-continue" onClick={onClose}>Continue browsing as guest</button>
    </section>
  </div>
}

function DiscoverPage({ venues, total, search, setSearch, sport, setSport, areas, area, setArea, onOpen, onGoPlayers, adventureEvents, onNavigateAnnouncement, onGoPage }) {
  const directoryRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(9)
  useEffect(() => {
    // Reset the page count only when the customer's filters change. Background
    // refreshes of owner-published venue data should not collapse the list.
    setVisibleCount(9)
  }, [search, sport, area])
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !directoryRef.current) return undefined
    const cards = directoryRef.current.querySelectorAll('[data-reveal-card]')
    if (!cards.length) return undefined
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    cards.forEach(card => { card.classList.add('reveal-pending'); observer.observe(card) })
    return () => observer.disconnect()
  }, [venues, visibleCount])
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
  const visibleVenues = venues.slice(0, visibleCount)
  const remainingVenues = Math.max(0, venues.length - visibleVenues.length)
  const scrollToDirectory = () => document.getElementById('venue-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const clearFilters = () => { setSearch(''); setSport('All'); setArea('All areas'); setVisibleCount(9) }
  return <div className="experiment-home">
    <section className="experiment-hero">
      <div className="experiment-hero-text">
        <span className="experiment-overline"><i/> MADE FOR THE WAY MADURAI PLAYS</span>
        <h1 className="experiment-hero-title"><span>Find your</span><span><em>next game.</em></span></h1>
        <p>From quick turf matches to discovering a new sport. Find a place, bring your people and get out there.</p>
        <div className="experiment-hero-actions"><button className="primary-btn" onClick={scrollToDirectory}>Explore venues <ArrowRight size={17}/></button><button className="experiment-outline-btn" onClick={() => onGoPage('events')}>See local events <ArrowUpRight size={16}/></button></div>
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

    <section className="directory-section experiment-directory" id="venue-directory" ref={directoryRef}>
      <div className="experiment-section-heading directory-heading" data-exp-reveal><div><span className="section-kicker">THE LOCAL DIRECTORY</span><h2>Find a place to play.</h2><p>Explore all {total} listed venues, with photos, owner-published videos and contact options around Madurai.</p></div><span className="listing-count"><i/>{total} listings</span></div>
      <div className="experiment-directory-tools"><div className="search-field"><Search size={18}/><input id="venue-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venue, sport or area"/><button onClick={() => setSearch('')} aria-label="Clear search"><X size={15}/></button></div><div className="area-filter-dropdown"><BootstrapDropdown label="Filter by area" value={area} options={areaOptions} onChange={setArea} searchable placeholder="All Madurai areas"/></div></div>
      <div className="filter-toolbar"><div className="sport-filters">{SPORTS.map(item => <button key={item} className={sport === item ? 'selected' : ''} onClick={() => setSport(item)}>{item === 'All' ? <SlidersHorizontal size={14}/> : null}{item}</button>)}</div></div>
      <div className="venue-result-line"><span><b>{venues.length}</b> places to explore <small>· Showing {venues.length ? 1 : 0}–{visibleVenues.length} of {venues.length}</small></span><span>Owner-published media appears when available.</span></div>
      <div className="venue-grid">{visibleVenues.map((venue, index) => <VenueCard key={venue.id} venue={venue} onClick={() => onOpen(venue)} revealIndex={index}/>)}{venues.length === 0 && <div className="empty-state"><Search size={28}/><strong>No venues found</strong><p>Try another search term, sport or area.</p><button className="secondary-btn" onClick={clearFilters}>Clear filters</button></div>}</div>
      {venues.length > 9 && <div className="venue-pagination"><span>Showing {visibleVenues.length} of {venues.length} venues</span><div>{visibleCount > 9 && <button className="secondary-btn" type="button" onClick={() => { setVisibleCount(9); scrollToDirectory() }}>Show first 9</button>}{remainingVenues > 0 && <button className="primary-btn" type="button" onClick={() => setVisibleCount(current => Math.min(venues.length, current + 9))}>Show more venues <ArrowDown size={16}/></button>}</div></div>}
    </section>

    <section className="experiment-sports-section" data-exp-reveal>
      <div className="experiment-section-heading"><div><span className="section-kicker">CHOOSE YOUR GAME</span><h2>One city. So many ways to play.</h2><p>Explore the sports and spaces that get you moving.</p></div><button className="experiment-text-link" onClick={scrollToDirectory}>Browse all venues <ArrowUpRight size={16}/></button></div>
      <div className="experiment-sport-grid">{sportTiles.map((item, index) => <button className="experiment-sport-card" key={item.name} onClick={() => { setSport(item.name); scrollToDirectory() }} data-exp-reveal style={{'--reveal-index': index}} aria-label={`Explore ${item.name} venues`}><span className="experiment-sport-art"><img src={item.image} alt={`${item.name} activity`} loading="lazy" decoding="async" style={{objectPosition:item.position}}/></span><span className="experiment-sport-symbol" aria-hidden="true">{item.icon}</span><span className="experiment-sport-copy"><strong>{item.name}</strong><small>{item.sub}</small></span><span className="experiment-sport-arrow"><ArrowUpRight size={18}/></span></button>)}</div>
    </section>

    <section className="experiment-shop-promo" data-exp-reveal>
      <div className="shop-promo-copy"><span className="section-kicker">SportiLand SHOP · GAME DAY ESSENTIALS</span><h2>Got the game.<br/><em>Get the gear.</em></h2><p>Pick up bats, balls, rackets, paddles, gloves and training essentials for your next session.</p><button className="primary-btn" type="button" onClick={() => onGoPage('shop')}>Shop essentials <ShoppingBag size={16}/><ArrowRight size={16}/></button></div>
      <div className="shop-promo-items" aria-label="Popular sports essentials"><span><Trophy size={19}/> Cricket bat</span><span><CircleHelp size={19}/> Match balls</span><span><Activity size={19}/> Rackets & paddles</span><span><Dumbbell size={19}/> Training gear</span></div>
    </section>

    <div className="experiment-manifesto-marquee" aria-label="Play more. Explore more."><div className="experiment-manifesto-track">{Array.from({length: 2}, (_, index) => <span key={index}>PLAY MORE <i>✳</i> EXPLORE MORE <i>✳</i> FIND YOUR GAME <i>✳</i> MAKE IT HAPPEN <i>✳</i></span>)}</div></div>

    <section className="experiment-story-section" data-exp-reveal>
      <div className="experiment-story-image" data-reveal-direction="left"><img data-scroll-parallax src="/assets/venues/bats-and-boots-turf.webp" alt="Football turf in Madurai" loading="lazy"/><span className="experiment-image-stamp">YOUR NEXT<br/>MOVE STARTS HERE</span></div>
      <div className="experiment-story-copy" data-reveal-direction="right"><span className="section-kicker">MORE THAN A PLACE TO PLAY</span><h2>Make room<br/>for <em>more play.</em></h2><p>Find the court for your usual game. Try something you’ve never played. Or pull your friends together for a weekend match.</p><div className="experiment-story-points"><span><b>01</b> Discover a venue near you</span><span><b>02</b> Check the facilities and media</span><span><b>03</b> Bring your team together</span></div><button className="primary-btn" onClick={scrollToDirectory}>Find your venue <ArrowRight size={16}/></button></div>
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
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="booking-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="booking-modal-photo"><img src={venue.photoUrl || '/assets/venue-illustrations/turf.svg'} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = venue.photoIllustration ? `/${venue.photoIllustration}` : '/assets/venue-illustrations/turf.svg' }} alt={venue.name}/><span>{venue.photoKind === 'generated-illustration' ? 'ILLUSTRATIVE IMAGE · NOT A VERIFIED VENUE PHOTO' : venue.photoKind === 'activity-illustration' ? 'SPORT PREVIEW · ILLUSTRATION' : 'VENUE DETAILS'}</span></div><div className="booking-modal-content"><div className="modal-heading"><span className="section-kicker">FIELD FINDER VENUE</span><h2>{venue.name}</h2><p><MapPin size={15}/>{venue.address || venue.area}</p></div><a className="venue-modal-directions" href={googleMapsDirectionsUrl(venue)} target="_blank" rel="noopener noreferrer"><MapPinned size={17}/> Get directions in Google Maps <ArrowUpRight size={15}/></a><p className="venue-description">{venue.summary}</p><RainPolicySummary venue={venue}/><div className="sport-tags modal-sports">{(venue.sports || []).map(s => <span key={s}>{s}</span>)}</div><button className="find-players-link" type="button" onClick={onFindPlayers}><Users size={15}/> Find players for this game</button>{!venue.externalListing && <div className="demo-info"><ShieldCheck size={16}/><span>Sample availability only. Confirm the slot with the venue before relying on it.</span></div>}
      {venue.media?.length > 0 && <section className="venue-media-gallery"><div className="gallery-heading"><h3><Images size={17}/> Venue photos & videos</h3><span>{venue.media.length} items</span></div><div className="venue-media-grid">{venue.media.map(item => <div className="venue-media-item" key={item.id}>{item.type === 'VIDEO' ? <video src={mediaUrl(item.url)} controls preload="metadata" playsInline/> : <img src={mediaUrl(item.url)} alt={item.caption || venue.name} loading="lazy"/>}<small>{item.caption || (item.type === 'VIDEO' ? 'Venue video' : 'Venue photo')}</small></div>)}</div></section>}
      {venue.externalListing ? <section className="external-venue-panel"><div className="external-venue-banner"><ShieldCheck size={17}/><span>Venue-managed activity. SportiLand does not hold live slots or take payment for this listing.</span></div>
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

function RainPolicySummary({ venue }) {
  const info = getVenueRoofInfo(venue)
  return <section className="rain-policy-summary" aria-label="Roofing and rain refund information">
    <div className="rain-policy-fact"><span>Roofing type</span><strong className={info.status === 'Not confirmed' ? 'unconfirmed' : ''}>{info.status}</strong></div>
    <div className="rain-policy-fact"><span>Rain-related refund</span><strong>{info.refundLabel}</strong></div>
    <p>Rain refunds depend on the venue being genuinely unplayable and owner verification. <a href="#terms-and-conditions" onClick={event => { event.preventDefault(); window.dispatchEvent(new CustomEvent('sportiland:open-terms')) }}>Read the full policy</a>.</p>
  </section>
}

function CheckoutModal({ venue, date, time, duration, price, paymentMethod, setPaymentMethod, onBack, onConfirm }) {
  return <div className="modal-backdrop checkout-layer"><div className="checkout-modal"><button className="modal-close" onClick={onBack}><X/></button><span className="section-kicker">DEMO CHECKOUT</span><h2>Review your booking</h2><p className="checkout-sub">Check the details before completing this demo booking.</p><div className="checkout-venue"><div><strong>{venue.name}</strong><span>{prettyDate(date)} · {prettyTime(time)} · {duration} hour{duration > 1 ? 's' : ''}</span></div><b>{money(price.total)}</b></div><RainPolicySummary venue={venue}/><div className="checkout-breakdown"><div><span>Slot subtotal</span><b>{money(price.subtotal)}</b></div><div><span>Discount</span><b className="discount-text">−{money(price.discount)}</b></div><div className="total-row"><span>Total to pay</span><strong>{money(price.total)}</strong></div></div><h3>Choose payment method</h3><div className="payment-options"><button className={paymentMethod === 'UPI demo' ? 'active' : ''} onClick={() => setPaymentMethod('UPI demo')}><Wallet/><span><b>UPI</b><small>Simulated demo payment</small></span><i/></button><button className={paymentMethod === 'Card demo' ? 'active' : ''} onClick={() => setPaymentMethod('Card demo')}><CreditCard/><span><b>Card</b><small>No card details collected</small></span><i/></button><button className={paymentMethod === 'Pay at venue (demo)' ? 'active' : ''} onClick={() => setPaymentMethod('Pay at venue (demo)')}><Banknote/><span><b>Pay at venue</b><small>Mark as pending in demo</small></span><i/></button></div><div className="payment-disclaimer"><ShieldCheck size={17}/><span>This is a payment-interface prototype. No bank, UPI or card transaction will occur.</span></div><button className="primary-btn full" onClick={onConfirm}>{paymentMethod === 'Pay at venue (demo)' ? 'Confirm demo booking' : 'Simulate successful payment'} <ArrowRight size={17}/></button></div></div>
}

function BookingsPage({ bookings, filter, setFilter, onCancel, onOpenPass }) {
  return <><PageHeader kicker="YOUR ACTIVITY" title="My bookings" description="Review your reservations, open your QR pass and share your booking details."/><div className="booking-filters">{['All','Awaiting owner confirmation','Confirmed','Cancelled'].map(item => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="customer-booking-list">{bookings.length ? bookings.map(b => <article className="customer-booking-card" key={b.id}><div className="booking-card-main"><span className="booking-ref">{b.id}</span><h3>{b.venueName}</h3><p><MapPin size={14}/>{b.area}</p><div className="booking-facts"><span><CalendarDays size={14}/>{prettyDate(b.date)}</span><span><Clock3 size={14}/>{prettyTime(b.time)}</span><span><Activity size={14}/>{b.duration} hour{b.duration > 1 ? 's' : ''}</span></div></div><div className="booking-card-side"><strong>{money(b.total)}</strong><span className={`status-pill ${b.status === 'Cancelled' ? 'cancelled' : b.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>{b.status}</span><small>Payment: {b.paymentStatus}</small><small className="booking-rain-inline">{b.roofStatus || 'Roofing not confirmed'} · {b.rainRefundPercent === null || b.rainRefundPercent === undefined ? 'Refund pending' : `${b.rainRefundPercent}% rain refund`}</small><button className="booking-pass-open" type="button" onClick={() => onOpenPass(b)}><QrCodeIcon/> View QR pass</button>{b.status !== 'Cancelled' && <button className="text-danger" onClick={() => onCancel(b.id)}>Cancel booking</button>}</div></article>) : <div className="empty-state"><CalendarDays size={30}/><strong>No bookings yet</strong><p>Your booking requests will appear here after checkout.</p></div>}</div><div className="availability-note"><ShieldCheck size={16}/><span>QR passes in this prototype are generated in your browser. Owners can scan and read the pass, but live booking verification requires a shared backend.</span></div></>
}

function createBookingPassToken() {
  try { return crypto.randomUUID() } catch { return `SPORTILAND-PASS-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}` }
}
function QrCodeIcon() { return <Ticket size={15}/> }

function BookingPassModal({ booking, onClose }) {
  const qrRef = useRef(null)
  const pass = {
    type: 'SPORTILAND_BOOKING_PASS', version: 1,
    bookingId: booking.id, token: booking.qrToken || createBookingPassToken(),
    customer: booking.customerName || 'SportiLand customer', venue: booking.venueName,
    area: booking.area, sport: booking.sport, date: booking.date, time: booking.time,
    durationHours: booking.duration, amount: booking.total,
    paymentStatus: booking.paymentStatus, bookingStatus: booking.status,
    roofStatus: booking.roofStatus || 'Not confirmed', rainRefundPercent: booking.rainRefundPercent ?? null, rainRefundLabel: booking.rainRefundLabel || 'Pending venue confirmation'
  }
  const qrValue = JSON.stringify(pass)
  const message = [
    '*SportiLand booking details*',
    `Booking ID: ${booking.id}`,
    `Venue: ${booking.venueName}`,
    `Sport: ${booking.sport}`,
    `Date: ${prettyDate(booking.date)}`,
    `Time: ${prettyTime(booking.time)} · ${booking.duration} hour(s)`,
    `Amount: ${money(booking.total)}`,
    `Payment: ${booking.paymentStatus}`,
    `Booking status: ${booking.status}`,
    `Roofing: ${booking.roofStatus || 'Not confirmed'}`,
    `Rain refund: ${booking.rainRefundPercent === null || booking.rainRefundPercent === undefined ? 'Pending venue confirmation' : `${booking.rainRefundPercent}% if eligible`}`,
    `QR pass code: ${pass.token}`,
    'Please show the SportiLand QR pass at the venue for check-in.'
  ].join('\n')
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  function downloadQr() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `SportiLand-${booking.id}-QR.png`
    link.click()
  }
  async function sharePass() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas && navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        if (blob) {
          const file = new File([blob], `SportiLand-${booking.id}-QR.png`, { type: 'image/png' })
          const data = { title: 'SportiLand booking pass', text: message, files: [file] }
          if (navigator.canShare(data)) {
            await navigator.share(data)
            return
          }
        }
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }
  return <div className="modal-backdrop ff-pass-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="ff-pass-modal" role="dialog" aria-modal="true" aria-label="SportiLand booking QR pass">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close QR pass"><X/></button>
      <div className="ff-pass-heading"><span className="ff-pass-success"><Check size={14}/> BOOKING REQUEST CREATED</span><h2>Your digital booking pass</h2><p>Save this QR code and show it to the turf owner when you arrive.</p></div>
      <div className="ff-pass-ticket">
        <div className="ff-pass-qr" ref={qrRef}><QRCodeCanvas value={qrValue} size={224} level="H" includeMargin /></div>
        <div className="ff-pass-id">{booking.id}</div>
        <div className="ff-pass-token">PASS TOKEN · {pass.token.slice(0, 8).toUpperCase()}</div>
      </div>
      <div className="ff-pass-details"><div><small>VENUE</small><strong>{booking.venueName}</strong></div><div><small>DATE & TIME</small><strong>{prettyDate(booking.date)} · {prettyTime(booking.time)}</strong></div><div><small>SPORT & DURATION</small><strong>{booking.sport} · {booking.duration} hour(s)</strong></div><div><small>AMOUNT / PAYMENT</small><strong>{money(booking.total)} · {booking.paymentStatus}</strong></div><div><small>ROOFING / RAIN REFUND</small><strong>{booking.roofStatus || 'Not confirmed'} · {booking.rainRefundPercent === null || booking.rainRefundPercent === undefined ? 'Pending confirmation' : `${booking.rainRefundPercent}% if eligible`}</strong></div></div>
      <div className="ff-pass-status"><ShieldCheck size={17}/><span><strong>{booking.status}</strong><small>This booking is awaiting owner confirmation. The QR pass is for identifying the request, not proof of payment.</small></span></div>
      <div className="ff-pass-actions"><button type="button" className="primary-btn" onClick={downloadQr}><DownloadIcon/> Download QR</button><button type="button" className="ff-whatsapp-button" onClick={sharePass}><WhatsAppIcon/> Share pass & details</button></div>
      <p className="ff-pass-note">On supported phones, the share sheet can include the QR image and booking message; choose WhatsApp. Otherwise WhatsApp opens with the prepared text, and you can attach the downloaded QR image. Automated delivery will be connected when the backend is available.</p>
    </section>
  </div>
}
function DownloadIcon() { return <Download size={16}/> }
function WhatsAppIcon() { return <Phone size={16}/> }
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
  return <><PageHeader kicker="ACCOUNT" title="My profile" description="Your SportiLand customer account and activity overview."/><div className="profile-grid"><section className="profile-card"><span className="profile-big-avatar">{user.name.slice(0,1).toUpperCase()}</span><h2>{user.name}</h2><p>@{user.username}</p><div className="profile-info"><span><Mail size={16}/>{user.email}</span>{user.phone && <span><Phone size={16}/>{user.phone}</span>}</div><button className="secondary-btn" onClick={onLogout}><LogOut size={15}/> Sign out</button></section><section className="profile-stats"><div className="profile-stat"><CalendarDays/><strong>{bookings.length}</strong><span>Total bookings</span></div><div className="profile-stat"><UserRoundPlus/><strong>{invites.length}</strong><span>Player invites sent</span></div><div className="profile-stat"><Wallet/><strong>{money(bookings.reduce((s,b)=>s+b.total,0))}</strong><span>Demo booking value</span></div></section></div><div className="availability-note"><ShieldCheck size={16}/><span>Profile data is saved locally in your browser in this demo. Real account management will use the shared backend.</span></div></>
}
function PageHeader({ kicker, title, description }) { return <section className="page-heading"><div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div></section> }

export default App
