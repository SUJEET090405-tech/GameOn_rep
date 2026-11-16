package com.kickoff.booking.booking;

import com.kickoff.booking.turf.Turf;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "bookings", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_booking_turf_date_slot",
                columnNames = {"turf_id", "booking_date", "time_slot"}
        )
})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turf_id", nullable = false)
    private Turf turf;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "time_slot", nullable = false, length = 30)
    private String timeSlot;

    @Column(nullable = false, length = 80)
    private String customerName;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    protected Booking() {
    }

    public Booking(Turf turf, LocalDate bookingDate, String timeSlot, String customerName, String email, String phone) {
        this.turf = turf;
        this.bookingDate = bookingDate;
        this.timeSlot = timeSlot;
        this.customerName = customerName;
        this.email = email;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public String getCustomerName() {
        return customerName;
    }
}
