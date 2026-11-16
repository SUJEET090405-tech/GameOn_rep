package com.kickoff.booking.booking;

import java.time.LocalDate;

public record BookingResponse(Long id, String customerName, LocalDate date, String timeSlot) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomerName(),
                booking.getBookingDate(),
                booking.getTimeSlot()
        );
    }
}
