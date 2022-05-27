# Development

## Workflow

To run all the packages locally at once, simply clone this repository and run:

```sh
yarn;
yarn build;  #only needs to be run the first time
yarn dev;
```

A hot reloading server should come up on localhost:3000, it's the exact same as what's at react-celo-c-labs.vercel.app.

Alternatively, you can individually run `react-celo` and the `example` app in parallel.

For that, you still need to have run `yarn` in the root.

Then, you can run `react-celo` in one tab:

```sh
cd packages/react-celo
yarn dev
```

and run the `example` app in another:

```sh
cd packages/example
yarn dev
```

## Bumping the packages

All packages under `/packages` are meant to published with the same version.

To bump the version of all the packages at once, use the `bump-versions` script.
You'll need to specify which semver increase you want to use.

For example, to bump to a prerelease:

```sh
yarn bump-versions prerelease --preId alpha
```

or for bumping a `major` version (same for `minor` or `patch`):

```sh
yarn bump-versions major
```

## Publishing the packages

Once the packages are ready to be published, ensure you've checked master and it is updated. Then, you can run the npm following npm script:

```sh
yarn publish-packages
```

Hint:

- You can use the `--dry-run` flag to check everything would run properly
- If you need to run the script multiple times without changing the code, using the `--skip-build` flag can be useful to reduce the time.
