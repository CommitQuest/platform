import { useEffect, useState } from 'react';

export const CLI_RELEASES_URL = 'https://github.com/CommitQuest/cli/releases';
export const CLI_LATEST_RELEASE_URL = `${CLI_RELEASES_URL}/latest`;
export const CLI_LATEST_RELEASE_API_URL = 'https://api.github.com/repos/CommitQuest/cli/releases/latest';

const FALLBACK_CLI_ASSET_NAME = 'commitquest-latest.tgz';
export const FALLBACK_CLI_TARBALL_URL = `${CLI_RELEASES_URL}/latest/download/${FALLBACK_CLI_ASSET_NAME}`;
export const FALLBACK_CLI_INSTALL_COMMAND = `npm install -g ${FALLBACK_CLI_TARBALL_URL}`;

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  html_url?: string;
  assets?: GitHubReleaseAsset[];
};

type CliReleaseState = {
  assetName: string;
  error: string | null;
  installCommand: string;
  isLoading: boolean;
  releaseUrl: string;
  tarballUrl: string;
};

const INITIAL_RELEASE_STATE: CliReleaseState = {
  assetName: FALLBACK_CLI_ASSET_NAME,
  error: null,
  installCommand: FALLBACK_CLI_INSTALL_COMMAND,
  isLoading: true,
  releaseUrl: CLI_LATEST_RELEASE_URL,
  tarballUrl: FALLBACK_CLI_TARBALL_URL,
};

const findCliTarballAsset = (assets: GitHubReleaseAsset[] = []): GitHubReleaseAsset | undefined =>
  assets.find((asset) => asset.name.toLowerCase() === FALLBACK_CLI_ASSET_NAME) ??
  assets.find((asset) => /^commitquest.*\.tgz$/i.test(asset.name)) ??
  assets.find((asset) => asset.name.toLowerCase().endsWith('.tgz'));

export function useLatestCliRelease(): CliReleaseState {
  const [release, setRelease] = useState<CliReleaseState>(INITIAL_RELEASE_STATE);

  useEffect(() => {
    let isMounted = true;

    const loadLatestRelease = async () => {
      try {
        const response = await fetch(CLI_LATEST_RELEASE_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        });

        if (!response.ok) {
          throw new Error(`GitHub latest release request failed with ${response.status}`);
        }

        const latestRelease = (await response.json()) as GitHubRelease;
        const tarballAsset = findCliTarballAsset(latestRelease.assets);

        if (!tarballAsset) {
          throw new Error('Latest CLI release does not include an npm tarball asset');
        }

        if (!isMounted) return;

        setRelease({
          assetName: tarballAsset.name,
          error: null,
          installCommand: `npm install -g ${tarballAsset.browser_download_url}`,
          isLoading: false,
          releaseUrl: latestRelease.html_url ?? CLI_LATEST_RELEASE_URL,
          tarballUrl: tarballAsset.browser_download_url,
        });
      } catch (error) {
        if (!isMounted) return;

        setRelease({
          ...INITIAL_RELEASE_STATE,
          error: error instanceof Error ? error.message : 'Unable to load latest CLI release',
          isLoading: false,
        });
      }
    };

    loadLatestRelease();

    return () => {
      isMounted = false;
    };
  }, []);

  return release;
}
