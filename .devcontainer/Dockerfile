FROM node:20-bookworm

ARG TZ
ENV TZ="$TZ"

# 基本開発ツール + ファイアウォール用 (iptables / ipset / dnsutils / aggregate)
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  sudo \
  unzip \
  gnupg2 \
  gh \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  python3 \
  ca-certificates \
  curl \
  && rm -rf /var/lib/apt/lists/*

ARG USERNAME=node

# bash 履歴を named volume に永続化
RUN mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

ENV DEVCONTAINER=true

RUN mkdir -p /workspace /home/$USERNAME/.claude /usr/local/share/npm-global && \
  chown -R $USERNAME:$USERNAME /workspace /home/$USERNAME/.claude /usr/local/share/npm-global

# node ユーザーが書ける npm グローバル prefix
# (root 配下 /usr/local/lib への書き込み EACCES を回避し、claude の自動更新も可能にする)
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

WORKDIR /workspace

# ファイアウォール初期化スクリプトのみ root 権限を許可 (NOPASSWD)
COPY init-firewall.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "$USERNAME ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall

USER $USERNAME

ENV SHELL=/bin/bash

# Claude Code CLI をコンテナ内にインストール
RUN npm install -g @anthropic-ai/claude-code
