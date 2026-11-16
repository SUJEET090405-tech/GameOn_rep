package com.kickoff.booking;

import com.kickoff.booking.turf.Turf;
import com.kickoff.booking.turf.TurfRepository;
import com.kickoff.booking.tournament.Tournament;
import com.kickoff.booking.tournament.TournamentFixture;
import com.kickoff.booking.tournament.TournamentFixtureRepository;
import com.kickoff.booking.tournament.TournamentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class TurfBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(TurfBookingApplication.class, args);
    }

    @Bean
    CommandLineRunner seedTurfs(TurfRepository turfRepository) {
        return args -> {
            if (turfRepository.count() == 0) {
                turfRepository.saveAll(List.of(
                        new Turf("The Greenyard", "Indiranagar, Bengaluru", "Football · 5-a-side",
                                new BigDecimal("1800"), new BigDecimal("4.9"),
                                "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80"),
                        new Turf("Sunday League Arena", "Koramangala, Bengaluru", "Football · 7-a-side",
                                new BigDecimal("2200"), new BigDecimal("4.8"),
                                "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80"),
                        new Turf("KickHouse Sports Hub", "HSR Layout, Bengaluru", "Football · 5-a-side",
                                new BigDecimal("1500"), new BigDecimal("4.7"),
                                "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80")
                ));
            }
        };
    }

    @Bean
    CommandLineRunner seedTournaments(
            TournamentRepository tournamentRepository,
            TournamentFixtureRepository fixtureRepository
    ) {
        return args -> {
            if (tournamentRepository.count() == 0) {
                LocalDateTime now = LocalDateTime.now();
                Tournament cityCup = tournamentRepository.save(new Tournament(
                        "Bengaluru City Cup",
                        "Football · 5-a-side",
                        "The Greenyard",
                        "Indiranagar, Bengaluru",
                        now.plusDays(7),
                        now.plusDays(5),
                        5,
                        16,
                        new BigDecimal("2500"),
                        "₹25,000 prize pool",
                        "A fast-paced weekend tournament for Bengaluru's community teams.",
                        "Gameon Sports"
                ));
                Tournament sunriseLeague = tournamentRepository.save(new Tournament(
                        "Sunrise Sunday League",
                        "Football · 7-a-side",
                        "Sunday League Arena",
                        "Koramangala, Bengaluru",
                        now.plusDays(14),
                        now.plusDays(11),
                        7,
                        12,
                        new BigDecimal("4000"),
                        "Trophy + ₹40,000",
                        "Bring your squad for a full day of football, food, and friendly competition.",
                        "Sunday League"
                ));
                tournamentRepository.save(new Tournament(
                        "HSR Night Kickabout",
                        "Football · 5-a-side",
                        "KickHouse Sports Hub",
                        "HSR Layout, Bengaluru",
                        now.plusDays(21),
                        now.plusDays(18),
                        5,
                        16,
                        new BigDecimal("1800"),
                        "Winning team gets the cup",
                        "An under-the-lights knockout tournament for local teams.",
                        "KickHouse"
                ));
                fixtureRepository.saveAll(List.of(
                        new TournamentFixture(cityCup, "Eastside FC", "The Strikers", now.plusDays(7).plusHours(1)),
                        new TournamentFixture(cityCup, "Green Machines", "Indiranagar United", now.plusDays(7).plusHours(2)),
                        new TournamentFixture(sunriseLeague, "Koramangala FC", "Sunday Best", now.plusDays(14).plusHours(1))
                ));
            }
        };
    }
}
