package com.kickoff.booking.booking;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(Long turfId, LocalDate date, List<String> bookedSlots) {
}
