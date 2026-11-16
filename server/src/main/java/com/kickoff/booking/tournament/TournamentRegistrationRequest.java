package com.kickoff.booking.tournament;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TournamentRegistrationRequest(
        @NotBlank @Size(max = 100) String teamName,
        @NotBlank @Size(max = 80) String captainName,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Pattern(regexp = "^[+()0-9 .-]{7,20}$", message = "Enter a valid phone number") String phone
) {
}
