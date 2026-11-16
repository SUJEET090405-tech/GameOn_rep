package com.kickoff.booking.tournament;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TournamentController {
    private final TournamentService tournamentService;
    private final OrganizerAccessService organizerAccessService;

    public TournamentController(TournamentService tournamentService, OrganizerAccessService organizerAccessService) {
        this.tournamentService = tournamentService;
        this.organizerAccessService = organizerAccessService;
    }

    @GetMapping("/tournaments")
    public List<TournamentResponse> getTournaments(@RequestParam(required = false) String location) {
        return tournamentService.getTournaments(location);
    }

    @GetMapping("/tournaments/{tournamentId}")
    public TournamentDetailResponse getTournament(@PathVariable Long tournamentId) {
        return tournamentService.getTournament(tournamentId);
    }

    @PostMapping("/organizer/verify")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyOrganizer(@RequestHeader(value = "X-Organizer-Key", required = false) String organizerKey) {
        organizerAccessService.requireAccess(organizerKey);
    }

    @PostMapping("/tournaments")
    @ResponseStatus(HttpStatus.CREATED)
    public TournamentResponse createTournament(
            @RequestHeader(value = "X-Organizer-Key", required = false) String organizerKey,
            @Valid @RequestBody TournamentRequest request
    ) {
        organizerAccessService.requireAccess(organizerKey);
        return tournamentService.createTournament(request);
    }

    @PostMapping("/tournaments/{tournamentId}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public TournamentRegistrationResponse registerTeam(
            @PathVariable Long tournamentId,
            @Valid @RequestBody TournamentRegistrationRequest request
    ) {
        return tournamentService.registerTeam(tournamentId, request);
    }

    @PostMapping("/tournaments/{tournamentId}/fixtures")
    @ResponseStatus(HttpStatus.CREATED)
    public TournamentFixtureResponse createFixture(
            @RequestHeader(value = "X-Organizer-Key", required = false) String organizerKey,
            @PathVariable Long tournamentId,
            @Valid @RequestBody FixtureRequest request
    ) {
        organizerAccessService.requireAccess(organizerKey);
        return tournamentService.createFixture(tournamentId, request);
    }

    @PatchMapping("/fixtures/{fixtureId}/score")
    public TournamentFixtureResponse updateScore(
            @RequestHeader(value = "X-Organizer-Key", required = false) String organizerKey,
            @PathVariable Long fixtureId,
            @Valid @RequestBody FixtureScoreRequest request
    ) {
        organizerAccessService.requireAccess(organizerKey);
        return tournamentService.updateScore(fixtureId, request);
    }

    @PatchMapping("/tournaments/{tournamentId}/status")
    public TournamentResponse updateTournamentStatus(
            @RequestHeader(value = "X-Organizer-Key", required = false) String organizerKey,
            @PathVariable Long tournamentId,
            @Valid @RequestBody TournamentStatusRequest request
    ) {
        organizerAccessService.requireAccess(organizerKey);
        return tournamentService.updateTournamentStatus(tournamentId, request.status());
    }
}
