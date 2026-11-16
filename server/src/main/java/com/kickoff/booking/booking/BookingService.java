package com.kickoff.booking.booking;

import com.kickoff.booking.turf.Turf;
import com.kickoff.booking.turf.TurfRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    private static final List<String> TIME_SLOTS = List.of(
            "06:00 AM - 07:00 AM",
            "07:00 AM - 08:00 AM",
            "08:00 AM - 09:00 AM",
            "09:00 AM - 10:00 AM",
            "04:00 PM - 05:00 PM",
            "05:00 PM - 06:00 PM",
            "06:00 PM - 07:00 PM",
            "07:00 PM - 08:00 PM",
            "08:00 PM - 09:00 PM"
    );

    private final BookingRepository bookingRepository;
    private final TurfRepository turfRepository;

    public BookingService(BookingRepository bookingRepository, TurfRepository turfRepository) {
        this.bookingRepository = bookingRepository;
        this.turfRepository = turfRepository;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Long turfId, LocalDate date) {
        if (!turfRepository.existsById(turfId)) {
            throw new ResourceNotFoundException("Turf not found.");
        }
        List<String> bookedSlots = bookingRepository.findAllByTurf_IdAndBookingDate(turfId, date).stream()
                .map(Booking::getTimeSlot)
                .toList();
        return new AvailabilityResponse(turfId, date, bookedSlots);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        if (!turfRepository.existsById(request.turfId())) {
            throw new ResourceNotFoundException("Turf not found.");
        }
        if (request.date().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Choose today or a future date.");
        }
        if (!TIME_SLOTS.contains(request.timeSlot())) {
            throw new IllegalArgumentException("Choose one of the available time slots.");
        }
        if (bookingRepository.existsByTurf_IdAndBookingDateAndTimeSlot(
                request.turfId(), request.date(), request.timeSlot())) {
            throw new BookingConflictException("That time slot was just booked. Please choose another.");
        }

        Turf turf = turfRepository.getReferenceById(request.turfId());
        try {
            Booking booking = bookingRepository.saveAndFlush(new Booking(
                    turf,
                    request.date(),
                    request.timeSlot(),
                    request.customerName().trim(),
                    request.email().trim().toLowerCase(),
                    request.phone().trim()
            ));
            return BookingResponse.from(booking);
        } catch (DataIntegrityViolationException exception) {
            throw new BookingConflictException("That time slot was just booked. Please choose another.", exception);
        }
    }
}
