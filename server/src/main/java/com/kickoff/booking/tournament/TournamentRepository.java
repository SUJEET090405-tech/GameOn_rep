package com.kickoff.booking.tournament;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findAllByOrderByStartsAtAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select tournament from Tournament tournament where tournament.id = :id")
    Optional<Tournament> findByIdForUpdate(@Param("id") Long id);
}
