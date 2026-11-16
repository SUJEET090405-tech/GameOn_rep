package com.kickoff.booking.tournament;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record FixtureRequest(
        @NotBlank @Size(max = 100) String homeTeam,
        @NotBlank @Size(max = 100) String awayTeam,
        @NotNull @FutureOrPresent LocalDateTime scheduledAt
) {
}
