# Public Seed Files DOX

## Purpose
- Owns small synthetic files used to test browser upload and simulated conversion flows.

## Local Contracts
- Seed files must not contain real customer data, secrets, licensed drawings, or proprietary project geometry.
- Keep fixtures small and deterministic so they are safe to commit and quick to upload in local browser tests.
- Use realistic file extensions and minimal format structure where practical.
- For proprietary binary CAD formats that cannot be authored safely by hand, mark fixtures clearly as sandbox placeholders.

## Verification
- Verify new seed files return `200` from the local Vite server.
- Test at least one relevant file through the client-side upload/conversion path after adding or changing fixtures.
