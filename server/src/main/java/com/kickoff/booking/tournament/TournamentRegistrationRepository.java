package com.kickoff.booking.tournament;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Long> {
    long countByTournament_Id(Long tournamentId);

    boolean existsByTournament_IdAndTeamNameIgnoreCase(Long tournamentId, String teamName);
}
