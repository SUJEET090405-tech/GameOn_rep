import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom'
import TournamentModule from './TournamentModule.jsx'
import './App.css'

const API = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const SPORTS = [
  { slug: 'football', label: 'Football' },
  { slug: 'cricket', label: 'Cricket' },
  { slug: 'badminton', label: 'Badminton' },
  { slug: 'basketball', label: 'Basketball' },
  { slug: 'tennis', label: 'Tennis' },
  { slug: 'volleyball', label: 'Volleyball' },
  { slug: 'pickleball', label: 'Pickleball' },
]

const timeSlots = [
  '06:00 AM - 07:00 AM',
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM',
]

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  const paths = {
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    sport: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64 5.64 18.36" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function localDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sportCategory(sport) {
  return sport.split('·')[0].trim().toLowerCase()
}

async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Something went wrong. Please try again.')
  }
  return response.status === 204 ? null : response.json()
}

function BookingDialog({ turf, onClose }) {
  const [date, setDate] = useState(localDate(new Date()))
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [slotError, setSlotError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    let active = true
    setLoadingSlots(true)
    setSlotError('')
    setSelectedSlot('')
    request(`/turfs/${turf.id}/availability?date=${date}`)
      .then((result) => {
        if (active) setBookedSlots(result.bookedSlots)
      })
      .catch((err) => {
        if (active) setSlotError(err.message)
      })
      .finally(() => {
        if (active) setLoadingSlots(false)
      })
    return () => { active = false }
  }, [date, turf.id])

  async function submitBooking(event) {
    event.preventDefault()
    if (!selectedSlot) {
      setError('Choose an available time slot to continue.')
      return
    }
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')
    try {
      const booking = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          turfId: turf.id,
          date,
          timeSlot: selectedSlot,
          customerName: form.get('customerName').trim(),
          email: form.get('email').trim(),
          phone: form.get('phone').trim(),
        }),
      })
      setConfirmation(booking)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close booking dialog">
          <Icon name="close" />
        </button>
        {confirmation ? (
          <div className="confirmation">
            <div className="confirmation-mark">✓</div>
            <span className="eyebrow">YOU'RE ALL SET</span>
            <h2 id="booking-title">Game on, {confirmation.customerName.split(' ')[0]}.</h2>
            <p>Your booking at <strong>{turf.name}</strong> is confirmed.</p>
            <div className="confirmation-details">
              <span><Icon name="calendar" size={17} />{confirmation.date}</span>
              <span><Icon name="clock" size={17} />{confirmation.timeSlot}</span>
              <span className="booking-reference">Booking #{confirmation.id}</span>
            </div>
            <button className="button button-dark button-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">MAKE IT A MATCH</span>
            <h2 id="booking-title">Book your game</h2>
            <p className="dialog-subtitle">{turf.name} <span>·</span> ₹{Number(turf.pricePerHour).toLocaleString('en-IN')} / hour</p>
            <label className="field-label" htmlFor="booking-date">Choose a date</label>
            <div className="date-input">
              <Icon name="calendar" size={18} />
              <input id="booking-date" type="date" min={localDate(new Date())} value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="slot-heading">
              <span className="field-label">Available slots</span>
              <span className="slot-timezone">All times local</span>
            </div>
            {loadingSlots ? <p className="inline-note">Checking availability…</p> : slotError ? (
              <p className="form-error" role="alert">{slotError}</p>
            ) : (
              <div className="slot-grid">
                {timeSlots.map((slot) => {
                  const unavailable = bookedSlots.includes(slot)
                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={unavailable}
                      className={`slot-button${selectedSlot === slot ? ' is-selected' : ''}`}
                      onClick={() => { setSelectedSlot(slot); setError('') }}
                    >
                      {slot.split(' - ')[0]}
                      {unavailable && <span>Booked</span>}
                    </button>
                  )
                })}
              </div>
            )}
            <form className="booking-form" onSubmit={submitBooking}>
              <div className="form-row">
                <label>Name<input name="customerName" autoComplete="name" required maxLength="80" placeholder="Your name" /></label>
                <label>Phone<input name="phone" type="tel" autoComplete="tel" required maxLength="20" placeholder="+91 98765 43210" /></label>
              </div>
              <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="120" placeholder="you@example.com" /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-dark button-full" type="submit" disabled={submitting || loadingSlots || !!slotError || !selectedSlot}>
                {submitting ? 'Confirming…' : 'Confirm booking'}
                {!submitting && <Icon name="arrow" size={17} />}
              </button>
            </form>
            <p className="secure-note">No payment required to reserve your slot.</p>
          </>
        )}
      </section>
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Gameon home">
        <span className="brand-mark"><Icon name="sport" size={21} /></span>
        <span>Gameon</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/turfs" className={({ isActive }) => isActive ? 'nav-active' : ''}>Find a venue</NavLink>
        <NavLink to="/tournaments" className={({ isActive }) => isActive ? 'nav-active' : ''}>Tournaments</NavLink>
        <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'nav-active' : ''}>How it works</NavLink>
      </nav>
      <Link className="header-cta" to="/turfs">Book a slot <Icon name="arrow" size={16} /></Link>
    </header>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-tag"><span className="live-dot" /> YOUR NEXT GAME STARTS HERE</div>
          <h1>Good games<br />start at a <span>great venue.</span></h1>
          <p>Find a place to play, bring your team together, and let the game do the talking.</p>
          <Link className="button button-accent" to="/turfs">Find a venue <Icon name="arrow" size={18} /></Link>
          <div className="hero-social-proof">
            <div className="avatar-stack"><span>R</span><span>A</span><span>K</span><span>M</span></div>
            <p><strong>Made for the love of the game.</strong><br />Your neighborhood, your next match.</p>
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Sports venue ready for a game">
          <div className="hero-photo"></div>
          <div className="hero-photo-wash"></div>
          <div className="pitch-line pitch-center"></div>
          <div className="pitch-circle"></div>
          <div className="hero-note">
            <span className="hero-note-icon"><Icon name="pin" size={17} /></span>
            <span><strong>Your city. Your game.</strong><small>Pick a place and play.</small></span>
          </div>
          <div className="hero-art-caption">YOUR CITY. YOUR SPORT. <span>↗</span></div>
        </div>
        <div className="hero-index">01 <span>—</span> 03</div>
      </section>

      <section className="trust-row" aria-label="Booking benefits">
        <span><i>01</i> Easy online booking</span><b>✳</b>
        <span><i>02</i> Real-time availability</span><b>✳</b>
        <span><i>03</i> More time on the pitch</span>
      </section>
    </>
  )
}

function FindTurfPage() {
  const { sport: sportSlug } = useParams()
  const [turfs, setTurfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedTurf, setSelectedTurf] = useState(null)
  const selectedSport = SPORTS.find(({ slug }) => slug === sportSlug)?.label || null

  useEffect(() => {
    request('/turfs')
      .then(setTurfs)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const sportTurfs = useMemo(() => (
    selectedSport
      ? turfs.filter((turf) => sportCategory(turf.sport) === selectedSport.toLowerCase())
      : turfs
  ), [selectedSport, turfs])

  const filteredTurfs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return sportTurfs
    return sportTurfs.filter((turf) =>
      `${turf.name} ${turf.location}`.toLowerCase().includes(normalized),
    )
  }, [query, sportTurfs])

  const venueCounts = useMemo(() => {
    const counts = Object.fromEntries(SPORTS.map(({ label }) => [label, 0]))
    turfs.forEach((turf) => {
      const sport = SPORTS.find(({ label }) => label.toLowerCase() === sportCategory(turf.sport))
      if (sport) counts[sport.label] += 1
    })
    return counts
  }, [turfs])

  if (sportSlug && !selectedSport) return <Navigate to="/turfs" replace />

  return (
    <>
      <section className="sport-browser" aria-label="Browse venues by sport">
        <div className="sport-browser-heading">
          <span className="eyebrow">CHOOSE YOUR GAME</span>
          <h2>Find a venue for <span>your sport.</span></h2>
        </div>
        <nav className="sport-filter" aria-label="Sports">
          <NavLink to="/turfs" end className={({ isActive }) => `sport-filter-button${isActive ? ' is-active' : ''}`}>
            All sports <span>{turfs.length}</span>
          </NavLink>
          {SPORTS.map(({ slug, label }) => (
            <NavLink
              key={slug}
              to={`/turfs/${slug}`}
              className={({ isActive }) => `sport-filter-button${isActive ? ' is-active' : ''}`}
            >
              {label} <span>{venueCounts[label]}</span>
            </NavLink>
          ))}
        </nav>
      </section>

      <section className="search-bar" aria-label="Find a turf">
        <label className="search-field">
          <span className="search-icon"><Icon name="pin" size={19} /></span>
          <span className="search-copy"><strong>Where to?</strong><small>City, area or venue name</small></span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search by city, area or venue name" placeholder="Search venues" />
        </label>
        <div className="search-divider"></div>
        <div className="search-field search-date">
          <span className="search-icon"><Icon name="calendar" size={19} /></span>
          <span className="search-copy"><strong>When are you playing?</strong><small>Pick your perfect time</small></span>
          <a href="#turfs" aria-label="Browse available dates"><Icon name="arrow" size={17} /></a>
        </div>
        <a className="search-button" href="#turfs"><Icon name="arrow" size={19} /></a>
      </section>

      <section className="turf-section" id="turfs">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PICK YOUR PLAYGROUND</span>
            <h2>{selectedSport ? <>Find <span>{selectedSport} venues.</span></> : <>Find a place to <span>play.</span></>}</h2>
          </div>
          <label className="sort-control">Showing <strong>{filteredTurfs.length} venues</strong><span>⌄</span></label>
        </div>
        {loading && <div className="status-message">Finding venues near you…</div>}
        {loadError && <div className="status-message status-error" role="alert">{loadError} Make sure the Spring Boot API is running, then <button onClick={() => window.location.reload()}>try again</button>.</div>}
        {!loading && !loadError && filteredTurfs.length === 0 && (
          <div className="status-message">
            {selectedSport && sportTurfs.length === 0
              ? `No ${selectedSport} venues are listed yet.`
              : `No venues match “${query}”. Try another city or area.`}
          </div>
        )}
        {!loading && !loadError && filteredTurfs.length > 0 && (
          <div className="turf-grid">
            {filteredTurfs.map((turf, index) => (
              <article className="turf-card" key={turf.id}>
                <div className="turf-image-wrap">
                  <img className="turf-image" src={turf.imageUrl} alt={`${turf.name} ${turf.sport} venue`} loading="lazy" />
                  <span className="turf-sport">{turf.sport}</span>
                  <button className="favorite-button" aria-label={`Save ${turf.name}`} onClick={(event) => event.currentTarget.classList.toggle('is-favorite')}>♡</button>
                  {index === 0 && <span className="popular-tag">PLAYER FAVORITE</span>}
                </div>
                <div className="turf-info">
                  <div className="turf-title-row">
                    <h3>{turf.name}</h3>
                    <span className="rating">
                      {Number(turf.rating) > 0 && <Icon name="star" size={14} />}
                      {Number(turf.rating) > 0 ? Number(turf.rating).toFixed(1) : 'New'}
                    </span>
                  </div>
                  <p className="turf-location"><Icon name="pin" size={15} />{turf.location}</p>
                  <div className="turf-card-bottom">
                    <div className="price"><strong>₹{Number(turf.pricePerHour).toLocaleString('en-IN')}</strong><span> / hour</span></div>
                    <button className="card-book" onClick={() => setSelectedTurf(turf)}>Book now <Icon name="arrow" size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTurf && <BookingDialog turf={selectedTurf} onClose={() => setSelectedTurf(null)} />}
    </>
  )
}

function HowItWorksPage() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="how-intro"><span className="eyebrow">LESS SCROLLING, MORE SCORING</span><h2>Game day,<br /><span>made easy.</span></h2></div>
      <div className="how-step"><span>01</span><h3>Choose a sport and venue</h3><p>Browse local courts, fields, and grounds to find the right place for your game.</p></div>
      <div className="how-step"><span>02</span><h3>Pick your time</h3><p>See live availability and choose a slot that works for everyone.</p></div>
      <div className="how-step"><span>03</span><h3>Get out and play</h3><p>Confirm your booking. We’ll save your spot — you bring the game.</p></div>
      <Link className="button button-accent how-cta" to="/turfs">Find a venue <Icon name="arrow" size={17} /></Link>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand" to="/" aria-label="Gameon home"><span className="brand-mark"><Icon name="sport" size={19} /></span><span>Gameon</span></Link>
      <span>Made for the love of the game.</span>
      <Link to="/turfs">Find a venue <Icon name="arrow" size={15} /></Link>
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/turfs" element={<FindTurfPage />} />
          <Route path="/turfs/:sport" element={<FindTurfPage />} />
          <Route path="/tournaments" element={<TournamentModule />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </BrowserRouter>
  )
}

export default App
