package com.kickoff.booking.tournament;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentFixtureRepository extends JpaRepository<TournamentFixture, Long> {
    List<TournamentFixture> findAllByTournament_IdOrderByScheduledAtAsc(Long tournamentId);

    long countByTournament_IdAndStatus(Long tournamentId, FixtureStatus status);
}
