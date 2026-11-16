package com.kickoff.booking.tournament;

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

import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_registrations", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_tournament_registration_team",
                columnNames = {"tournament_id", "team_name"}
        )
})
public class TournamentRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;

    @Column(nullable = false, length = 80)
    private String captainName;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false)
    private LocalDateTime registeredAt;

    protected TournamentRegistration() {
    }

    public TournamentRegistration(Tournament tournament, String teamName, String captainName, String email, String phone) {
        this.tournament = tournament;
        this.teamName = teamName;
        this.captainName = captainName;
        this.email = email;
        this.phone = phone;
        this.registeredAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTeamName() {
        return teamName;
    }
}
