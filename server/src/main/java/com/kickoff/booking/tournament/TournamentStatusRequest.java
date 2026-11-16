package com.kickoff.booking.tournament;

import jakarta.validation.constraints.NotNull;

public record TournamentStatusRequest(@NotNull TournamentStatus status) {
}
