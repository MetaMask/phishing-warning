# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.3]
### Changed
- Update `ses` to `v1.1.0` ([#143](https://github.com/MetaMask/phishing-warning/pull/143))

## [3.0.2]
### Fixed
- change to hostname for Github issues ([#127](https://github.com/MetaMask/phishing-warning/pull/127))

## [3.0.1]
### Changed
- Using href url param only for suspect site ([#124](https://github.com/MetaMask/phishing-warning/pull/124))

## [3.0.0]
### Changed
- **BREAKING**: Increase minimum Node.js version to 16 ([#107](https://github.com/MetaMask/phishing-warning/pull/107))
- **BREAKING**: This package now returns streams conforming to the API of readable-stream@3.x. ([#122](https://github.com/MetaMask/phishing-warning/pull/122)) ([#104](https://github.com/MetaMask/phishing-warning/pull/104))
  - Bump @metamask/post-message-stream from ^6.2.0 to ^7.0.0 ([#104](https://github.com/MetaMask/phishing-warning/pull/104))
  - Upgrade obj-multiplex to @metamask/object-multiplex@^2.0.0 ([#122](https://github.com/MetaMask/phishing-warning/pull/122))

### Fixed
- Bump ses from ^0.18.7 to ^0.18.8 ([#120](https://github.com/MetaMask/phishing-warning/pull/120))

## [2.1.1]
### Fixed
- Dependency updates ([#105](https://github.com/MetaMask/phishing-warning/pull/105))
  - Move @types/punycode from dependencies to devDependencies
  - Update @metamask/design-tokens from ^1.6.0 to ^1.12.0
  - Update @metamask/post-message-stream from ^6.0.0 to ^6.2.0
  - Update punycode from ^2.1.1 to ^2.3.0
  - Update ses from ^0.18.1 to ^0.18.7

## [2.1.0]
### Changed
- "Back to safety" button now triggers a `backToSafetyPhishingWarning` message to be sent on the `phishingSafelistStream` ([#84](https://github.com/MetaMask/phishing-warning/pull/84))

## [2.0.1]
### Fixed
- Restore iframe warning and "open in new tab" link ([#73](https://github.com/MetaMask/phishing-warning/pull/73))

## [2.0.0]
### Changed
- **BREAKING:** Dynamically lookup the source of a block ([#57](https://github.com/MetaMask/phishing-warning/pull/57))
  - The query parameter `newIssueUrl` is no longer accepted. Instead this page will look up the source of a block dynamically.
  - We no longer show on the page which project is responsible for the block. This will be restored in a future version.
- Redesign the phishing warning page ([#52](https://github.com/MetaMask/phishing-warning/pull/52))

## [1.2.2]
### Changed
- Update `ses` version from v0.12.4 to v10.18.1 ([#53](https://github.com/MetaMask/phishing-warning/pull/53))
- Update @metamask/design-tokens from 1.9.0 to 1.11.1 ([#46](https://github.com/MetaMask/phishing-warning/pull/46))
  - This includes minor color updates.

## [1.2.1]
### Fixed
- Fix build script to exclude file imports from `@metamask/post-message-stream` which expect to only run in the context of a Web worker ([#27](https://github.com/MetaMask/phishing-warning/pull/27))

## [1.2.0] [DEPRECATED]
### Added
- Add a check for the protocol of the url being blocked. Remove `continue at your own risk` option if protocol is disallowed ([#16](https://github.com/MetaMask/phishing-warning/pull/16))
- Add optional arg `newIssueUrl` to `getUrl` function so that the correct link to direct disputes can be specified by a hash query param. ([#23](https://github.com/MetaMask/phishing-warning/pull/23))

## [1.1.0]
### Added
- Add service worker for offline caching ([#9](https://github.com/MetaMask/phishing-warning/pull/9))
- Add favicons ([#8](https://github.com/MetaMask/phishing-warning/pull/8))
- Add actions to publish to gh-pages ([#3](https://github.com/MetaMask/phishing-warning/pull/3))
- Add dummy "main" script ([#6](https://github.com/MetaMask/phishing-warning/pull/6))
  - This allows locating the package install directory using `require.resolve`, which is better for compatibility between package managers.
  - The main script throws an error, helping to prevent accidental misuse.
- Skip initialization if the page is being loaded solely to install the service worker ([#11](https://github.com/MetaMask/phishing-warning/pull/11))
  - If the hash `#extensionStartup` is set, skip setup and assume the page is being loaded just for service worker installation. We use this technique to ensure the service worker is installed during the MetaMask extension startup process.
- Add anti-clickjacking measures ([#12](https://github.com/MetaMask/phishing-warning/pull/12))
  - A script was added to the HTML file to detect when the frame is being embedded. If it detects that it is embedded, a separate design is used that prompts the user to open the warning page in a new tab to proceed. This ensures the blocked page cannot be added to the safelist via a clickjacking attack.

## [1.0.0]
### Changed
- Initial implementation of the phishing warning page
  - This should behave identically to the phishing warning page built into the MetaMask extension.

[Unreleased]: https://github.com/MetaMask/phishing-warning/compare/v3.0.3...HEAD
[3.0.3]: https://github.com/MetaMask/phishing-warning/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/MetaMask/phishing-warning/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/MetaMask/phishing-warning/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/MetaMask/phishing-warning/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/MetaMask/phishing-warning/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/MetaMask/phishing-warning/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/MetaMask/phishing-warning/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/MetaMask/phishing-warning/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/MetaMask/phishing-warning/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/MetaMask/phishing-warning/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/MetaMask/phishing-warning/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MetaMask/phishing-warning/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MetaMask/phishing-warning/releases/tag/v1.0.0
