package com.kickoff.booking.tournament;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TournamentResponse(
        Long id,
        String name,
        String sport,
        String venue,
        String city,
        LocalDateTime startsAt,
        LocalDateTime registrationDeadline,
        Integer teamSize,
        Integer maxTeams,
        BigDecimal entryFee,
        String prizeDescription,
        String description,
        String organizerName,
        TournamentStatus status,
        long registeredTeams,
        long liveFixtures
) {
}
