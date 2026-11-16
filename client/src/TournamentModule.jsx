import { useCallback, useEffect, useMemo, useState } from 'react'
import './TournamentModule.css'

const API = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

async function tournamentRequest(path, options = {}) {
  const { headers, ...requestOptions } = options
  const response = await fetch(`${API}${path}`, {
    ...requestOptions,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'The request could not be completed.')
  }
  return response.status === 204 ? null : response.json()
}

function localDateTime(date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function formatDate(value, options = { dateStyle: 'medium', timeStyle: 'short' }) {
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(value))
}

function Modal({ title, onClose, children, className = '' }) {
  return (
    <div className="tournament-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className={`tournament-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <button className="tournament-modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        {children}
      </section>
    </div>
  )
}

function OrganizerAccessDialog({ onClose, onVerified }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await tournamentRequest('/organizer/verify', {
        method: 'POST',
        headers: { 'X-Organizer-Key': key },
      })
      onVerified(key)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Organizer access" onClose={onClose} className="organizer-access-dialog">
      <span className="tournament-eyebrow">ORGANIZER STUDIO</span>
      <h2>Welcome, organizer.</h2>
      <p className="tournament-muted">Enter your organizer key to publish events and manage fixtures.</p>
      <form className="tournament-form" onSubmit={submit}>
        <label>Organizer key<input type="password" autoComplete="current-password" value={key} onChange={(event) => setKey(event.target.value)} required /></label>
        {error && <p className="tournament-error" role="alert">{error}</p>}
        <button className="tournament-button tournament-button-dark" disabled={submitting}>
          {submitting ? 'Checking…' : 'Continue to studio'}
        </button>
      </form>
    </Modal>
  )
}

function CreateTournamentForm({ organizerKey, onCreated, onCancel }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    setError('')
    try {
      const tournament = await tournamentRequest('/tournaments', {
        method: 'POST',
        headers: { 'X-Organizer-Key': organizerKey },
        body: JSON.stringify({
          name: data.get('name').trim(),
          sport: data.get('sport').trim(),
          city: data.get('city').trim(),
          venue: data.get('venue').trim(),
          startsAt: data.get('startsAt'),
          registrationDeadline: data.get('registrationDeadline'),
          teamSize: Number(data.get('teamSize')),
          maxTeams: Number(data.get('maxTeams')),
          entryFee: Number(data.get('entryFee')),
          prizeDescription: data.get('prizeDescription').trim(),
          description: data.get('description').trim(),
          organizerName: data.get('organizerName').trim(),
        }),
      })
      onCreated(tournament)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const now = new Date()
  const defaultStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const defaultDeadline = new Date(defaultStart.getTime() - 2 * 24 * 60 * 60 * 1000)

  return (
    <form className="tournament-form create-tournament-form" onSubmit={submit}>
      <div className="tournament-form-heading">
        <div><span className="tournament-eyebrow">PUBLISH AN EVENT</span><h3>Create a tournament</h3></div>
        <button type="button" className="tournament-text-button" onClick={onCancel}>Cancel</button>
      </div>
      <label>Tournament name<input name="name" required maxLength="100" placeholder="e.g. Bengaluru City Cup" /></label>
      <div className="tournament-form-grid">
        <label>Sport / format<input name="sport" required maxLength="50" placeholder="Football · 5-a-side" /></label>
        <label>City / area<input name="city" required maxLength="80" placeholder="Indiranagar, Bengaluru" /></label>
        <label>Venue<input name="venue" required maxLength="120" placeholder="Ground or sports complex" /></label>
        <label>Organizer name<input name="organizerName" required maxLength="80" placeholder="Your club or organization" /></label>
        <label>Starts at<input name="startsAt" type="datetime-local" min={localDateTime(now)} defaultValue={localDateTime(defaultStart)} required /></label>
        <label>Registration closes<input name="registrationDeadline" type="datetime-local" min={localDateTime(now)} defaultValue={localDateTime(defaultDeadline)} required /></label>
        <label>Players per team<input name="teamSize" type="number" min="1" max="30" defaultValue="5" required /></label>
        <label>Team capacity<input name="maxTeams" type="number" min="2" max="512" defaultValue="16" required /></label>
        <label>Entry fee per team (₹)<input name="entryFee" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label>Prize details<input name="prizeDescription" maxLength="200" placeholder="Optional" /></label>
      </div>
      <label>About this tournament<textarea name="description" rows="3" maxLength="2000" required placeholder="Share the format, schedule, and what teams can expect." /></label>
      {error && <p className="tournament-error" role="alert">{error}</p>}
      <button className="tournament-button tournament-button-dark" disabled={submitting}>
        {submitting ? 'Publishing…' : 'Publish tournament'}
      </button>
    </form>
  )
}

function RegistrationDialog({ tournament, onClose, onRegistered }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(null)

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    setError('')
    try {
      const result = await tournamentRequest(`/tournaments/${tournament.id}/registrations`, {
        method: 'POST',
        body: JSON.stringify({
          teamName: data.get('teamName').trim(),
          captainName: data.get('captainName').trim(),
          email: data.get('email').trim(),
          phone: data.get('phone').trim(),
        }),
      })
      setRegistered(result)
      onRegistered()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Register your team" onClose={onClose} className="organizer-access-dialog">
      {registered ? (
        <div className="registration-success">
          <div className="tournament-success-mark">✓</div>
          <span className="tournament-eyebrow">YOU'RE IN</span>
          <h2>Team registered.</h2>
          <p><strong>{registered.teamName}</strong> is on the list for {registered.tournamentName}.</p>
          <button className="tournament-button tournament-button-dark" onClick={onClose}>Done</button>
        </div>
      ) : (
        <>
          <span className="tournament-eyebrow">JOIN THE LINEUP</span>
          <h2>Register your team.</h2>
          <p className="tournament-muted">{tournament.name} · ₹{Number(tournament.entryFee).toLocaleString('en-IN')} per team</p>
          <form className="tournament-form" onSubmit={submit}>
            <label>Team name<input name="teamName" required maxLength="100" placeholder="Your team name" /></label>
            <label>Captain's name<input name="captainName" required maxLength="80" placeholder="Full name" /></label>
            <label>Email<input name="email" type="email" required maxLength="120" placeholder="captain@example.com" /></label>
            <label>Phone<input name="phone" type="tel" required maxLength="20" placeholder="+91 98765 43210" /></label>
            {error && <p className="tournament-error" role="alert">{error}</p>}
            <button className="tournament-button tournament-button-dark" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register team'}
            </button>
          </form>
        </>
      )}
    </Modal>
  )
}

function FixtureRow({ fixture, organizerKey, onUpdated }) {
  const [homeScore, setHomeScore] = useState(fixture.homeScore)
  const [awayScore, setAwayScore] = useState(fixture.awayScore)
  const [status, setStatus] = useState(fixture.status)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editable = Boolean(organizerKey)

  useEffect(() => {
    if (!dirty) {
      setHomeScore(fixture.homeScore)
      setAwayScore(fixture.awayScore)
      setStatus(fixture.status)
    }
  }, [dirty, fixture.awayScore, fixture.homeScore, fixture.status])

  async function updateScore(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await tournamentRequest(`/fixtures/${fixture.id}/score`, {
        method: 'PATCH',
        headers: { 'X-Organizer-Key': organizerKey },
        body: JSON.stringify({ homeScore: Number(homeScore), awayScore: Number(awayScore), status }),
      })
      setDirty(false)
      await onUpdated()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={`fixture-row${fixture.status === 'LIVE' ? ' fixture-is-live' : ''}`}>
      <div className="fixture-match">
        <div className="fixture-time">{formatDate(fixture.scheduledAt, { dateStyle: 'medium', timeStyle: 'short' })}</div>
        <strong>{fixture.homeTeam}</strong>
        <span className="fixture-score">{fixture.homeScore} <i>:</i> {fixture.awayScore}</span>
        <strong>{fixture.awayTeam}</strong>
        <span className={`fixture-status fixture-status-${fixture.status.toLowerCase()}`}>
          {fixture.status === 'COMPLETED' ? 'FINAL' : fixture.status}
        </span>
      </div>
      {editable && (
        <form className="fixture-score-editor" onSubmit={updateScore}>
          <label>{fixture.homeTeam}<input type="number" min="0" value={homeScore} onChange={(event) => { setHomeScore(event.target.value); setDirty(true) }} required /></label>
          <label>{fixture.awayTeam}<input type="number" min="0" value={awayScore} onChange={(event) => { setAwayScore(event.target.value); setDirty(true) }} required /></label>
          <select aria-label="Fixture status" value={status} onChange={(event) => { setStatus(event.target.value); setDirty(true) }}>
            <option value="SCHEDULED">Scheduled</option><option value="LIVE">Live</option><option value="COMPLETED">Final</option>
          </select>
          <button className="tournament-button tournament-button-small" disabled={busy}>{busy ? 'Saving…' : 'Update score'}</button>
          {error && <p className="tournament-error" role="alert">{error}</p>}
        </form>
      )}
    </article>
  )
}

function FixtureCreator({ tournament, organizerKey, onCreated }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setError('')
    try {
      await tournamentRequest(`/tournaments/${tournament.id}/fixtures`, {
        method: 'POST',
        headers: { 'X-Organizer-Key': organizerKey },
        body: JSON.stringify({
          homeTeam: data.get('homeTeam').trim(),
          awayTeam: data.get('awayTeam').trim(),
          scheduledAt: data.get('scheduledAt'),
        }),
      })
      form.reset()
      await onCreated()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="fixture-create-form" onSubmit={submit}>
      <span className="tournament-eyebrow">BUILD THE FIXTURES</span>
      <div className="fixture-create-fields">
        <label>Home team<input name="homeTeam" required maxLength="100" /></label>
        <label>Away team<input name="awayTeam" required maxLength="100" /></label>
        <label>Kick-off<input name="scheduledAt" type="datetime-local" min={localDateTime(new Date())} defaultValue={localDateTime(new Date(tournament.startsAt))} required /></label>
        <button className="tournament-button tournament-button-dark" disabled={busy}>{busy ? 'Adding…' : 'Add fixture'}</button>
      </div>
      {error && <p className="tournament-error" role="alert">{error}</p>}
    </form>
  )
}

function TournamentDetailsDialog({ detail, organizerKey, onClose, onRegistered, onUpdated }) {
  const tournament = detail.tournament
  const [registerOpen, setRegisterOpen] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [error, setError] = useState('')
  const registrationOpen = tournament.status === 'OPEN'

  async function changeStatus(status) {
    setStatusBusy(true)
    setError('')
    try {
      await tournamentRequest(`/tournaments/${tournament.id}/status`, {
        method: 'PATCH',
        headers: { 'X-Organizer-Key': organizerKey },
        body: JSON.stringify({ status }),
      })
      await onUpdated()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setStatusBusy(false)
    }
  }

  return (
    <>
      <Modal title={tournament.name} onClose={onClose} className="tournament-details-dialog">
        <div className="tournament-detail-hero">
          <span className={`tournament-status tournament-status-${tournament.status.toLowerCase()}`}>{tournament.status}</span>
          <span className="tournament-eyebrow">{tournament.sport}</span>
          <h2>{tournament.name}</h2>
          <p>{tournament.venue} · {tournament.city}</p>
          <div className="tournament-detail-meta">
            <span>📅 {formatDate(tournament.startsAt)}</span>
            <span>👥 {tournament.registeredTeams} / {tournament.maxTeams} teams</span>
            <span>🏆 {tournament.prizeDescription || 'Tournament prizes'}</span>
          </div>
          <p className="tournament-description">{tournament.description}</p>
          <div className="tournament-detail-actions">
            <button className="tournament-button tournament-button-accent" disabled={!registrationOpen} onClick={() => setRegisterOpen(true)}>
              {registrationOpen ? 'Register your team' : 'Registration closed'}
            </button>
            {organizerKey && (
              <label className="tournament-status-control">Event status
                <select value={tournament.status} disabled={statusBusy} onChange={(event) => changeStatus(event.target.value)}>
                  <option value="OPEN">Registration open</option><option value="LIVE">Live</option><option value="COMPLETED">Completed</option>
                </select>
              </label>
            )}
          </div>
          {error && <p className="tournament-error" role="alert">{error}</p>}
        </div>

        <div className="fixture-section">
          <div className="fixture-section-heading">
            <div><span className="tournament-eyebrow">THE ACTION</span><h3>Fixtures & results</h3></div>
            <span className="score-refresh"><span className="refresh-dot" /> Live updates every 10 seconds</span>
          </div>
          {detail.fixtures.length === 0 ? (
            <p className="tournament-empty-fixtures">Fixtures will appear here once the organizer publishes them.</p>
          ) : (
            <div className="fixture-list">
              {detail.fixtures.map((fixture) => (
                <FixtureRow key={fixture.id} fixture={fixture} organizerKey={organizerKey} onUpdated={onUpdated} />
              ))}
            </div>
          )}
          {organizerKey && tournament.status !== 'COMPLETED' && (
            <FixtureCreator tournament={tournament} organizerKey={organizerKey} onCreated={onUpdated} />
          )}
        </div>
      </Modal>
      {registerOpen && <RegistrationDialog tournament={tournament} onClose={() => setRegisterOpen(false)} onRegistered={onRegistered} />}
    </>
  )
}

function TournamentCard({ tournament, onOpen }) {
  return (
    <article className="tournament-card">
      <div className="tournament-card-top">
        <span className="tournament-sport-mark">GO<span>•</span></span>
        <span className={`tournament-status tournament-status-${tournament.status.toLowerCase()}`}>
          {tournament.status === 'OPEN' ? 'REGISTRATION OPEN' : tournament.status}
        </span>
      </div>
      <span className="tournament-eyebrow">{tournament.sport}</span>
      <h3>{tournament.name}</h3>
      <p className="tournament-location">⌖ {tournament.city} <span>·</span> {tournament.venue}</p>
      <div className="tournament-card-stats">
        <div><span>STARTS</span><strong>{formatDate(tournament.startsAt, { day: 'numeric', month: 'short' })}</strong></div>
        <div><span>TEAMS</span><strong>{tournament.registeredTeams}<i> / {tournament.maxTeams}</i></strong></div>
        <div><span>ENTRY</span><strong>{Number(tournament.entryFee) === 0 ? 'Free' : `₹${Number(tournament.entryFee).toLocaleString('en-IN')}`}</strong></div>
      </div>
      {tournament.liveFixtures > 0 && <span className="tournament-live-count"><span className="refresh-dot" />{tournament.liveFixtures} live {tournament.liveFixtures === 1 ? 'match' : 'matches'}</span>}
      <button className="tournament-card-link" onClick={() => onOpen(tournament.id)}>
        View tournament <span>↗</span>
      </button>
    </article>
  )
}

function TournamentModule() {
  const [tournaments, setTournaments] = useState([])
  const [query, setQuery] = useState('')
  const [pageError, setPageError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [organizerKey, setOrganizerKey] = useState('')
  const [accessOpen, setAccessOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const refreshTournaments = useCallback(async () => {
    const data = await tournamentRequest('/tournaments')
    setTournaments(data)
    setPageError('')
  }, [])

  const refreshDetail = useCallback(async () => {
    if (!selectedId) return
    const data = await tournamentRequest(`/tournaments/${selectedId}`)
    setDetail(data)
  }, [selectedId])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await tournamentRequest('/tournaments')
        if (active) {
          setTournaments(data)
          setPageError('')
        }
      } catch (error) {
        if (active) setPageError(error.message)
      }
    }
    load()
    const timer = window.setInterval(load, 15000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return undefined
    }
    let active = true
    const load = async () => {
      try {
        const data = await tournamentRequest(`/tournaments/${selectedId}`)
        if (active) {
          setDetail(data)
          setDetailLoading(false)
        }
      } catch (error) {
        if (active) {
          setPageError(error.message)
          setDetailLoading(false)
        }
      }
    }
    load()
    const timer = window.setInterval(load, 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [selectedId])

  const filteredTournaments = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return tournaments
    return tournaments.filter((tournament) =>
      `${tournament.name} ${tournament.city} ${tournament.venue} ${tournament.sport}`.toLowerCase().includes(search),
    )
  }, [query, tournaments])

  async function openTournament(id) {
    setDetail(null)
    setDetailLoading(true)
    setSelectedId(id)
  }

  async function refreshAfterChange() {
    setRefreshing(true)
    try {
      await Promise.all([refreshTournaments(), refreshDetail()])
    } catch (error) {
      setPageError(error.message)
    } finally {
      setRefreshing(false)
    }
  }

  async function onCreated(tournament) {
    setCreateOpen(false)
    await refreshTournaments()
    setDetailLoading(true)
    setSelectedId(tournament.id)
  }

  return (
    <section className="tournaments-section" id="tournaments">
      <div className="tournaments-heading">
        <div>
          <span className="tournament-eyebrow">MORE THAN A MATCH</span>
          <h2>Find your next <span>tournament.</span></h2>
          <p>Local competitions, good teams, and a reason to play your best.</p>
        </div>
        <div className="tournaments-heading-actions">
          {organizerKey ? (
            <>
              <button className="tournament-button tournament-button-accent" onClick={() => setCreateOpen((open) => !open)}>
                {createOpen ? 'Close studio' : '+ Create tournament'}
              </button>
              <button className="tournament-text-button" onClick={() => { setOrganizerKey(''); setCreateOpen(false) }}>Sign out</button>
            </>
          ) : (
            <button className="tournament-button tournament-button-outline" onClick={() => setAccessOpen(true)}>Organizer access</button>
          )}
        </div>
      </div>

      {organizerKey && (
        <div className="organizer-banner">
          <div><span className="organizer-live-dot" /><span><strong>Organizer studio</strong><small>Publish tournaments, build fixtures, and update live scores.</small></span></div>
          <span className="organizer-banner-tag">SIGNED IN</span>
        </div>
      )}

      {createOpen && organizerKey && (
        <CreateTournamentForm organizerKey={organizerKey} onCreated={onCreated} onCancel={() => setCreateOpen(false)} />
      )}

      <div className="tournament-filters">
        <label className="tournament-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, sport, or tournament" aria-label="Search tournaments" />
        </label>
        <span className="tournament-count">{filteredTournaments.length} {filteredTournaments.length === 1 ? 'tournament' : 'tournaments'} near you</span>
      </div>

      {pageError && <p className="tournament-error tournament-page-error" role="alert">{pageError} Check that the API is running, then <button onClick={() => refreshTournaments().catch((error) => setPageError(error.message))}>retry</button>.</p>}
      {!pageError && filteredTournaments.length === 0 ? (
        <div className="tournament-empty">
          <span>✳</span>
          <h3>{tournaments.length ? 'No tournaments match that search.' : 'The next big game starts here.'}</h3>
          <p>{tournaments.length ? 'Try another city, sport, or tournament name.' : 'Check back soon for local events, or sign in as an organizer to post one.'}</p>
        </div>
      ) : (
        <div className="tournament-grid">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} onOpen={openTournament} />
          ))}
        </div>
      )}
      <div className="tournaments-footnote"><span><span className="refresh-dot" /> Scores refresh automatically</span><span>{refreshing ? 'Updating…' : 'Your next match is out there.'}</span></div>

      {accessOpen && (
        <OrganizerAccessDialog
          onClose={() => setAccessOpen(false)}
          onVerified={(key) => { setOrganizerKey(key); setAccessOpen(false) }}
        />
      )}
      {selectedId && detail && (
        <TournamentDetailsDialog
          detail={detail}
          organizerKey={organizerKey}
          onClose={() => { setSelectedId(null); setDetail(null) }}
          onRegistered={refreshAfterChange}
          onUpdated={refreshAfterChange}
        />
      )}
      {selectedId && detailLoading && !detail && <div className="tournament-loading" role="status">Loading tournament…</div>}
    </section>
  )
}

export default TournamentModule
