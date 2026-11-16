package com.kickoff.booking.turf;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/turfs")
public class TurfController {
    private final TurfRepository turfRepository;

    public TurfController(TurfRepository turfRepository) {
        this.turfRepository = turfRepository;
    }

    @GetMapping
    public List<TurfResponse> getTurfs() {
        return turfRepository.findAll().stream()
                .map(TurfResponse::from)
                .toList();
    }
}
