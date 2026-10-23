# Small production deployment

Build on the same operating system and architecture as the production server
(Linux for a Linux Hostinger server), using Node 22:

```sh
npm ci
npm run check
npm run build
npm run package:deploy
```

The last command creates a new `dist/deploy-<build-id>` directory. Deploy the
**contents of that directory**, with `node server.js` (or `npm start`) as the
startup command. Set `NODE_ENV=production`, the hosting-provided `PORT`, and
`HOSTNAME=0.0.0.0`. Public environment configuration must be present at build
time, as in the existing deployment. Preserve the current hosting configuration
until the new release has been verified.

The package contains Next's traced runtime dependencies, pre-rendered pages,
static assets and `public/`. It excludes the repository, source, development
dependencies, tests, QA reports, build cache and development output. It needs
no install or build step after upload. `release-manifest.json` records its size,
build ID and build platform. A Windows-built runtime is for Windows validation;
build the production artifact on Linux rather than copying Windows native
dependencies to Linux.

For the existing Git-based deployment, `npm run build` still builds normally
and `next start` remains usable. Cloning Git and installing every dependency
will retain additional files; the slim package must actually be used to obtain
its disk savings. This does not automatically clean old Hostinger releases,
backups or caches. After the owner deploys and verifies the new release, the
owner can remove obsolete releases through the hosting controls.

The source regression suite stays in the development repository so future
calculator changes can be verified. It is absent from the runtime package.

Do not upload the entire project folder, `.next/cache`, `.next/dev`, local
`node_modules`, `docs`, `tests`, `.git`, or local environment files.
