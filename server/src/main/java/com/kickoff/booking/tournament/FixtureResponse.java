package com.kickoff.booking.tournament;

import java.time.LocalDateTime;

public record FixtureResponse(
        Long id,
        String homeTeam,
        String awayTeam,
        LocalDateTime scheduledAt,
        Integer homeScore,
        Integer awayScore,
        FixtureStatus status
) {
    public static FixtureResponse from(TournamentFixture fixture) {
        return new FixtureResponse(
                fixture.getId(),
                fixture.getHomeTeam(),
                fixture.getAwayTeam(),
                fixture.getScheduledAt(),
                fixture.getHomeScore(),
                fixture.getAwayScore(),
                fixture.getStatus()
        );
    }
}
