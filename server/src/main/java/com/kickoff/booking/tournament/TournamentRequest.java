package com.kickoff.booking.tournament;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TournamentRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 50) String sport,
        @NotBlank @Size(max = 120) String venue,
        @NotBlank @Size(max = 80) String city,
        @NotNull @Future LocalDateTime startsAt,
        @NotNull LocalDateTime registrationDeadline,
        @NotNull @Min(1) @Max(30) Integer teamSize,
        @NotNull @Min(2) @Max(512) Integer maxTeams,
        @NotNull @DecimalMin("0.00") BigDecimal entryFee,
        @Size(max = 200) String prizeDescription,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 80) String organizerName
) {
}
