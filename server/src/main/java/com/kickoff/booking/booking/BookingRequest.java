package com.kickoff.booking.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record BookingRequest(
        @NotNull Long turfId,
        @NotNull LocalDate date,
        @NotBlank String timeSlot,
        @NotBlank @Size(max = 80) String customerName,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Pattern(regexp = "^[+()0-9 .-]{7,20}$", message = "Enter a valid phone number") String phone
) {
}
