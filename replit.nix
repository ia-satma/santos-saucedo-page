{ pkgs }: let
  # Replit's stable-24_05 contains ClamAV 1.3, whose signature downloads have
  # ended. Pin the official NixOS package set for a supported scanning engine
  # without changing the rest of the workspace runtime.
  uploadPackages = import (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/55bfb4d7437bd4e09ab7cba58a43bd68eb310044.tar.gz";
  }) { system = pkgs.stdenv.hostPlatform.system; };
in {
  deps = [ uploadPackages.clamav ];
}
