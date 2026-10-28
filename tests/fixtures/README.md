# Original asset baseline

`original-asset-hashes.json` records SHA-256 values from Git commit `a05bbb04503aac02435acc35b5c67d6f6afd5547`. JSON data and license TXT files normalize CRLF to LF before hashing; JPEG files retain raw binary hashes. This makes the preserved-content check portable between Windows and LF checkouts.

The separate release audit retains the original 95 Windows worktree byte hashes. These working-copy EOL differences are not source-content changes.
