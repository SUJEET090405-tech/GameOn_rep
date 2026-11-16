package com.kickoff.booking.tournament;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FixtureScoreRequest(
        @NotNull @Min(0) Integer homeScore,
        @NotNull @Min(0) Integer awayScore,
        @NotNull FixtureStatus status
) {
}
