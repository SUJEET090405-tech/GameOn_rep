package com.kickoff.booking.turf;

import java.math.BigDecimal;

public record TurfResponse(
        Long id,
        String name,
        String location,
        String sport,
        BigDecimal pricePerHour,
        BigDecimal rating,
        String imageUrl
) {
    public static TurfResponse from(Turf turf) {
        return new TurfResponse(
                turf.getId(),
                turf.getName(),
                turf.getLocation(),
                turf.getSport(),
                turf.getPricePerHour(),
                turf.getRating(),
                turf.getImageUrl()
        );
    }
}
