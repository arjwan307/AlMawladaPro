# Embedded private-network integration (work in progress)

## Intended product behavior
- Windows remains the sole owner of the SQLite database and financial API.
- Android connects over an embedded private network, even on cellular data.
- No public HTTP port, port forwarding, cloud database, or shared production auth key.
- Windows displays a one-time QR invitation; an administrator approves each device.
- Each device has a revocable identity, role and session; financial writes are auditable and idempotent.

## Transport
Windows: embed Tailscale using the official Go tsnet library and expose an HTTP listener only on the tailnet. Electron communicates with the bridge on localhost. Keep tsnet state in Electron's userData directory, separate from SQLite.

Android: integrate Tailscale's Android-native networking components / userspace stack. The existing WebView is not itself a VPN or embedded Tailscale client. Establish a secure transport before loading the app UI; never disable TLS checks or publish the gateway on the Internet.

## Enrollment and secrets
Use a user-initiated Tailscale login or delegated enrollment flow. Do not package reusable Tailscale auth keys in the EXE/APK or place long-lived application tokens in a QR URL. QR invitation must be single-use, short-lived, device-bound and approved on Windows.

## Release gates
1. Implement and compile Windows embedded tsnet sidecar; ensure auto-start, persistence, and safe shutdown.
2. Implement Android embedded network engine, enrollment, and reconnect behavior.
3. Implement app-layer login, authorization and per-device revocation.
4. Verify that API cannot be accessed outside the tailnet.
5. Verify payment deduplication, authorization and end-to-end audit trails.
6. Test Wi-Fi to mobile-data transition and Windows restart on physical devices.
7. Produce signed Windows installer and Android release APK after passing tests.

The existing debug APK and the optional VPN gateway are prototypes and do not meet these release gates.
