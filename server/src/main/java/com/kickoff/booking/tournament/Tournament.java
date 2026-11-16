package com.kickoff.booking.tournament;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournaments")
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String sport;

    @Column(nullable = false, length = 120)
    private String venue;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false)
    private LocalDateTime startsAt;

    @Column(nullable = false)
    private LocalDateTime registrationDeadline;

    @Column(nullable = false)
    private Integer teamSize;

    @Column(nullable = false)
    private Integer maxTeams;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal entryFee;

    @Column(length = 200)
    private String prizeDescription;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 80)
    private String organizerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TournamentStatus status;

    protected Tournament() {
    }

    public Tournament(
            String name,
            String sport,
            String venue,
            String city,
            LocalDateTime startsAt,
            LocalDateTime registrationDeadline,
            Integer teamSize,
            Integer maxTeams,
            BigDecimal entryFee,
            String prizeDescription,
            String description,
            String organizerName
    ) {
        this.name = name;
        this.sport = sport;
        this.venue = venue;
        this.city = city;
        this.startsAt = startsAt;
        this.registrationDeadline = registrationDeadline;
        this.teamSize = teamSize;
        this.maxTeams = maxTeams;
        this.entryFee = entryFee;
        this.prizeDescription = prizeDescription;
        this.description = description;
        this.organizerName = organizerName;
        this.status = TournamentStatus.OPEN;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSport() {
        return sport;
    }

    public String getVenue() {
        return venue;
    }

    public String getCity() {
        return city;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public LocalDateTime getRegistrationDeadline() {
        return registrationDeadline;
    }

    public Integer getTeamSize() {
        return teamSize;
    }

    public Integer getMaxTeams() {
        return maxTeams;
    }

    public BigDecimal getEntryFee() {
        return entryFee;
    }

    public String getPrizeDescription() {
        return prizeDescription;
    }

    public String getDescription() {
        return description;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public TournamentStatus getStatus() {
        return status;
    }

    public void setStatus(TournamentStatus status) {
        this.status = status;
    }
}
