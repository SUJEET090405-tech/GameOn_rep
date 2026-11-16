package com.kickoff.booking.tournament;

public class TournamentConflictException extends RuntimeException {
    public TournamentConflictException(String message) {
        super(message);
    }

    public TournamentConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
