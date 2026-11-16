package com.kickoff.booking.tournament;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentFixtureRepository fixtureRepository;

    public TournamentService(
            TournamentRepository tournamentRepository,
            TournamentRegistrationRepository registrationRepository,
            TournamentFixtureRepository fixtureRepository
    ) {
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.fixtureRepository = fixtureRepository;
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getTournaments(String location) {
        String search = location == null ? "" : location.trim().toLowerCase();
        return tournamentRepository.findAllByOrderByStartsAtAsc().stream()
                .filter(tournament -> search.isEmpty()
                        || tournament.getCity().toLowerCase().contains(search)
                        || tournament.getVenue().toLowerCase().contains(search)
                        || tournament.getName().toLowerCase().contains(search)
                        || tournament.getSport().toLowerCase().contains(search))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TournamentDetailResponse getTournament(Long tournamentId) {
        Tournament tournament = findTournament(tournamentId);
        List<FixtureResponse> fixtures = fixtureRepository
                .findAllByTournament_IdOrderByScheduledAtAsc(tournamentId)
                .stream()
                .map(FixtureResponse::from)
                .toList();
        return new TournamentDetailResponse(toResponse(tournament), fixtures);
    }

    @Transactional
    public TournamentResponse createTournament(TournamentRequest request) {
        if (!request.registrationDeadline().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("The registration deadline must be in the future.");
        }
        if (!request.registrationDeadline().isBefore(request.startsAt())) {
            throw new IllegalArgumentException("Registration must close before the tournament starts.");
        }

        Tournament tournament = tournamentRepository.save(new Tournament(
                request.name().trim(),
                request.sport().trim(),
                request.venue().trim(),
                request.city().trim(),
                request.startsAt(),
                request.registrationDeadline(),
                request.teamSize(),
                request.maxTeams(),
                request.entryFee(),
                cleanOptional(request.prizeDescription()),
                request.description().trim(),
                request.organizerName().trim()
        ));
        return toResponse(tournament);
    }

    @Transactional
    public TournamentRegistrationResponse registerTeam(Long tournamentId, TournamentRegistrationRequest request) {
        Tournament tournament = tournamentRepository.findByIdForUpdate(tournamentId)
                .orElseThrow(() -> new TournamentNotFoundException("Tournament not found."));
        if (tournament.getStatus() != TournamentStatus.OPEN) {
            throw new TournamentConflictException("Registration is closed for this tournament.");
        }
        if (!tournament.getRegistrationDeadline().isAfter(LocalDateTime.now())) {
            throw new TournamentConflictException("The registration deadline has passed.");
        }
        if (registrationRepository.countByTournament_Id(tournamentId) >= tournament.getMaxTeams()) {
            throw new TournamentConflictException("This tournament has reached its team limit.");
        }
        if (registrationRepository.existsByTournament_IdAndTeamNameIgnoreCase(
                tournamentId, request.teamName().trim())) {
            throw new TournamentConflictException("A team with that name is already registered.");
        }

        try {
            TournamentRegistration registration = registrationRepository.saveAndFlush(new TournamentRegistration(
                    tournament,
                    request.teamName().trim(),
                    request.captainName().trim(),
                    request.email().trim().toLowerCase(),
                    request.phone().trim()
            ));
            return new TournamentRegistrationResponse(
                    registration.getId(),
                    registration.getTeamName(),
                    tournament.getName()
            );
        } catch (DataIntegrityViolationException exception) {
            throw new TournamentConflictException("A team with that name is already registered.", exception);
        }
    }

    @Transactional
    public TournamentFixtureResponse createFixture(Long tournamentId, FixtureRequest request) {
        Tournament tournament = findTournament(tournamentId);
        if (tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new TournamentConflictException("Fixtures cannot be added to a completed tournament.");
        }
        if (request.homeTeam().trim().equalsIgnoreCase(request.awayTeam().trim())) {
            throw new IllegalArgumentException("A team cannot play against itself.");
        }
        if (request.scheduledAt().isBefore(tournament.getStartsAt())) {
            throw new IllegalArgumentException("A fixture cannot start before the tournament.");
        }
        TournamentFixture fixture = fixtureRepository.save(new TournamentFixture(
                tournament,
                request.homeTeam().trim(),
                request.awayTeam().trim(),
                request.scheduledAt()
        ));
        return TournamentFixtureResponse.from(fixture);
    }

    @Transactional
    public TournamentFixtureResponse updateScore(Long fixtureId, FixtureScoreRequest request) {
        TournamentFixture fixture = fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new TournamentNotFoundException("Fixture not found."));
        if (fixture.getTournament().getStatus() == TournamentStatus.COMPLETED
                && fixture.getStatus() != FixtureStatus.COMPLETED) {
            throw new TournamentConflictException("This tournament is completed.");
        }
        fixture.updateScore(request.homeScore(), request.awayScore(), request.status());
        return TournamentFixtureResponse.from(fixtureRepository.save(fixture));
    }

    @Transactional
    public TournamentResponse updateTournamentStatus(Long tournamentId, TournamentStatus status) {
        Tournament tournament = findTournament(tournamentId);
        if (status == TournamentStatus.OPEN && !tournament.getRegistrationDeadline().isAfter(LocalDateTime.now())) {
            throw new TournamentConflictException("Registration cannot be reopened after its deadline.");
        }
        if (status == TournamentStatus.COMPLETED
                && (fixtureRepository.countByTournament_IdAndStatus(tournamentId, FixtureStatus.SCHEDULED) > 0
                || fixtureRepository.countByTournament_IdAndStatus(tournamentId, FixtureStatus.LIVE) > 0)) {
            throw new TournamentConflictException("Complete every fixture before completing the tournament.");
        }
        tournament.setStatus(status);
        return toResponse(tournamentRepository.save(tournament));
    }

    private Tournament findTournament(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new TournamentNotFoundException("Tournament not found."));
    }

    private TournamentResponse toResponse(Tournament tournament) {
        long liveFixtures = fixtureRepository.countByTournament_IdAndStatus(tournament.getId(), FixtureStatus.LIVE);
        return new TournamentResponse(
                tournament.getId(),
                tournament.getName(),
                tournament.getSport(),
                tournament.getVenue(),
                tournament.getCity(),
                tournament.getStartsAt(),
                tournament.getRegistrationDeadline(),
                tournament.getTeamSize(),
                tournament.getMaxTeams(),
                tournament.getEntryFee(),
                tournament.getPrizeDescription(),
                tournament.getDescription(),
                tournament.getOrganizerName(),
                tournament.getStatus(),
                registrationRepository.countByTournament_Id(tournament.getId()),
                liveFixtures
        );
    }

    private String cleanOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
