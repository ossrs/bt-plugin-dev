# Usage:
# Build image:
#     docker build -t test .
# Note that should start with --privileged to run systemd.
#     docker run \
#         --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:rw --cgroupns=host \
#         -d --rm -it -v $(pwd):/g -w /g --name=install test
# Start a shell:
#     docker exec -it install /bin/bash

#FROM ubuntu:focal
# See https://hub.docker.com/r/jrei/systemd-ubuntu/tags
FROM ${ARCH}jrei/systemd-ubuntu:focal AS dist

# https://serverfault.com/questions/949991/how-to-install-tzdata-on-a-ubuntu-docker-image
ENV DEBIAN_FRONTEND=noninteractive

# To use if in RUN, see https://github.com/moby/moby/issues/7281#issuecomment-389440503
# Note that only exists issue like "/bin/sh: 1: [[: not found" for Ubuntu20, no such problem in CentOS7.
SHELL ["/bin/bash", "-c"]

# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#apt-get
# Note that we install docker.io because we don't use the docker plugin.
RUN apt update -y && apt-get install -y docker.io make gdb gcc g++ wget vim tree python3 python3-venv \
    fonts-lato javascript-common libjs-jquery libruby2.7 libyaml-0-2 rake \
    ruby ruby-minitest ruby-net-telnet ruby-power-assert ruby-test-unit ruby-xmlrpc \
    ruby2.7 rubygems-integration unzip zip libcurl4

# See https://www.bt.cn/
# Note: We use very simple user `ossrs` and password `12345678` for local development environment, you should change it in production environment.
# Note: We disable the HTTPS by sed `SET_SSL=false` in install.sh.
# Note: We remove the plugin oneav and webssh, which is not necessary.
RUN cd /tmp && \
    wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && \
    sed -i 's/SET_SSL=true/SET_SSL=false/g' install.sh && \
    bash install.sh ed8484bec --user ossrs --password 12345678 --port 7800 --safe-path /srscloud -y && \
    echo "Remove the BT plugin oneav, a security tool." && \
    if [[ -f /www/server/panel/plugin/oneav/oneav.bundle ]]; then curl -sSL https://download.bt.cn/install/plugin/oneav/install.sh |bash -s -- uninstall; fi && \
    echo "Remove the BT plugin webssh, a SSH tool." && \
    if [[ -f /www/server/panel/plugin/webssh/install.sh ]]; then bash /www/server/panel/plugin/webssh/install.sh uninstall; fi && \
    echo "Install NGINX for BT." && \
    curl -sSL https://download.bt.cn/install/4/nginx.sh |bash -s -- install 1.22

# Setup the safe path again, because the `--safe-path` does not work.
# Enable the develop debug mode.
RUN echo '/srscloud' > /www/server/panel/data/admin_path.pl && \
    echo 'True' > /www/server/panel/data/debug.pl
