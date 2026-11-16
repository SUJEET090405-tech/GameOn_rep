package com.kickoff.booking.tournament;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {
    private static final Long TOURNAMENT_ID = 3L;
    private final LocalDateTime start = LocalDateTime.now().plusDays(10);

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private TournamentRegistrationRepository registrationRepository;

    @Mock
    private TournamentFixtureRepository fixtureRepository;

    @InjectMocks
    private TournamentService tournamentService;

    @Test
    void doesNotAcceptTeamsAfterCapacityIsReached() {
        Tournament tournament = tournament();
        when(tournamentRepository.findByIdForUpdate(TOURNAMENT_ID)).thenReturn(Optional.of(tournament));
        when(registrationRepository.countByTournament_Id(TOURNAMENT_ID)).thenReturn(2L);

        assertThrows(TournamentConflictException.class, () -> tournamentService.registerTeam(
                TOURNAMENT_ID,
                new TournamentRegistrationRequest("Northside", "Aarav", "captain@example.com", "+91 98765 43210")
        ));
        verify(registrationRepository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsRegistrationDeadlineAfterTournamentStart() {
        TournamentRequest request = new TournamentRequest(
                "City Cup",
                "Football",
                "The Greenyard",
                "Bengaluru",
                start,
                start.plusDays(1),
                5,
                16,
                BigDecimal.ZERO,
                null,
                "A local tournament.",
                "Gameon Sports"
        );

        assertThrows(IllegalArgumentException.class, () -> tournamentService.createTournament(request));
        verify(tournamentRepository, never()).save(any(Tournament.class));
    }

    @Test
    void publishesUpdatedScoreAndFixtureStatus() {
        Tournament tournament = tournament();
        TournamentFixture fixture = new TournamentFixture(
                tournament,
                "Northside",
                "Southside",
                start.plusHours(1)
        );
        when(fixtureRepository.findById(8L)).thenReturn(Optional.of(fixture));
        when(fixtureRepository.save(fixture)).thenReturn(fixture);

        TournamentFixtureResponse response = tournamentService.updateScore(
                8L,
                new FixtureScoreRequest(3, 2, FixtureStatus.LIVE)
        );

        assertEquals(3, response.homeScore());
        assertEquals(2, response.awayScore());
        assertEquals(FixtureStatus.LIVE, response.status());
    }

    @Test
    void organizerKeyMustMatchConfiguredValue() {
        OrganizerAccessService accessService = new OrganizerAccessService("secret-key");

        accessService.requireAccess("secret-key");
        assertThrows(OrganizerAuthorizationException.class, () -> accessService.requireAccess("wrong-key"));
    }

    @Test
    void doesNotCompleteTournamentWhileFixturesAreUnfinished() {
        when(tournamentRepository.findById(TOURNAMENT_ID)).thenReturn(Optional.of(tournament()));
        when(fixtureRepository.countByTournament_IdAndStatus(TOURNAMENT_ID, FixtureStatus.SCHEDULED)).thenReturn(1L);

        assertThrows(TournamentConflictException.class, () -> tournamentService.updateTournamentStatus(
                TOURNAMENT_ID,
                TournamentStatus.COMPLETED
        ));
        verify(tournamentRepository, never()).save(any(Tournament.class));
    }

    private Tournament tournament() {
        return new Tournament(
                "City Cup",
                "Football",
                "The Greenyard",
                "Bengaluru",
                start,
                start.minusDays(2),
                5,
                2,
                BigDecimal.ZERO,
                null,
                "A local tournament.",
                "Gameon Sports"
        );
    }
}
