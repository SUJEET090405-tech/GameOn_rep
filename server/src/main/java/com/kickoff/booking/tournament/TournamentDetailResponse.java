package com.kickoff.booking.tournament;

import java.util.List;

public record TournamentDetailResponse(TournamentResponse tournament, List<FixtureResponse> fixtures) {
}
