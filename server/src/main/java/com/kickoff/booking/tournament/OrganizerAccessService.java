package com.kickoff.booking.tournament;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class OrganizerAccessService {
    private final byte[] configuredKey;

    public OrganizerAccessService(@Value("${gameon.organizer.api-key}") String configuredKey) {
        this.configuredKey = configuredKey.getBytes(StandardCharsets.UTF_8);
    }

    public void requireAccess(String providedKey) {
        if (providedKey == null || !MessageDigest.isEqual(
                configuredKey,
                providedKey.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new OrganizerAuthorizationException("Organizer access denied.");
        }
    }
}
