package com.kickoff.booking.tournament;

import java.time.LocalDateTime;

public record TournamentFixtureResponse(
        Long id,
        Long tournamentId,
        String homeTeam,
        String awayTeam,
        LocalDateTime scheduledAt,
        Integer homeScore,
        Integer awayScore,
        FixtureStatus status
) {
    public static TournamentFixtureResponse from(TournamentFixture fixture) {
        return new TournamentFixtureResponse(
                fixture.getId(),
                fixture.getTournament().getId(),
                fixture.getHomeTeam(),
                fixture.getAwayTeam(),
                fixture.getScheduledAt(),
                fixture.getHomeScore(),
                fixture.getAwayScore(),
                fixture.getStatus()
        );
    }
}
