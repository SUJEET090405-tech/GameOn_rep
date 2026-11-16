package com.kickoff.booking.booking;

import com.kickoff.booking.turf.Turf;
import com.kickoff.booking.turf.TurfRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    private static final Long TURF_ID = 1L;
    private static final String SLOT = "06:00 PM - 07:00 PM";
    private final LocalDate bookingDate = LocalDate.now().plusDays(1);

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TurfRepository turfRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void rejectsUnsupportedTimeSlot() {
        when(turfRepository.existsById(TURF_ID)).thenReturn(true);
        BookingRequest request = request("12:00 PM - 01:00 PM");

        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(request));
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void rejectsSlotAlreadyBooked() {
        when(turfRepository.existsById(TURF_ID)).thenReturn(true);
        when(bookingRepository.existsByTurf_IdAndBookingDateAndTimeSlot(TURF_ID, requestDate(), SLOT))
                .thenReturn(true);

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(request(SLOT)));
    }

    @Test
    void persistsBookingForAvailableSlot() {
        when(turfRepository.existsById(TURF_ID)).thenReturn(true);
        when(bookingRepository.existsByTurf_IdAndBookingDateAndTimeSlot(TURF_ID, requestDate(), SLOT))
                .thenReturn(false);
        when(turfRepository.getReferenceById(TURF_ID)).thenReturn(
                new Turf("The Greenyard", "Indiranagar, Bengaluru", "Football · 5-a-side",
                        BigDecimal.valueOf(1800), BigDecimal.valueOf(4.9),
                        "https://example.com/turf.jpg")
        );
        when(bookingRepository.saveAndFlush(any(Booking.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.createBooking(request(SLOT));

        assertEquals("Aarav Patel", response.customerName());
        assertEquals(requestDate(), response.date());
        assertEquals(SLOT, response.timeSlot());
        verify(bookingRepository).saveAndFlush(any(Booking.class));
    }

    private BookingRequest request(String slot) {
        return new BookingRequest(
                TURF_ID,
                bookingDate,
                slot,
                "Aarav Patel",
                "aarav@example.com",
                "+91 98765 43210"
        );
    }

    private LocalDate requestDate() {
        return bookingDate;
    }
}
