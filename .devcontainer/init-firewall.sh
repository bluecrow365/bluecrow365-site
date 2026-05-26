#!/bin/bash
# デフォルト全拒否のアウトバウンドファイアウォール。
# 許可: DNS / localhost / ホストネットワーク / GitHub / npm / Anthropic API のみ。
set -euo pipefail
IFS=$'\n\t'

# 既存ルール・ipset を初期化
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

# 制限をかける前に DNS / SSH / localhost を許可
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p udp --sport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --sport 22 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# 許可 CIDR/IP を保持する ipset を作成
ipset create allowed-domains hash:net

# GitHub の公式 IP レンジを取得して許可
echo "Fetching GitHub IP ranges..."
gh_ranges=$(curl -s https://api.github.com/meta)
if [ -z "$gh_ranges" ]; then
  echo "ERROR: Failed to fetch GitHub IP ranges"
  exit 1
fi
if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null; then
  echo "ERROR: GitHub API response missing required fields"
  exit 1
fi
echo "Processing GitHub IPs..."
while read -r cidr; do
  if [[ ! "$cidr" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}$ ]]; then
    echo "WARNING: Invalid CIDR skipped: $cidr"
    continue
  fi
  ipset add allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git + .hooks)[]' | aggregate -q)

# その他の許可ドメインを解決して許可
for domain in \
  registry.npmjs.org \
  api.anthropic.com \
  console.anthropic.com \
  claude.ai \
  sentry.io \
  statsig.anthropic.com \
  statsig.com; do
  echo "Resolving $domain..."
  ips=$(dig +short A "$domain")
  if [ -z "$ips" ]; then
    echo "WARNING: Failed to resolve $domain"
    continue
  fi
  while read -r ip; do
    if [[ ! "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
      continue
    fi
    ipset add allowed-domains "$ip" 2>/dev/null || true
  done < <(echo "$ips")
done

# ホストネットワーク (VS Code Server 通信用) を許可
HOST_IP=$(ip route | grep default | cut -d" " -f3)
if [ -n "$HOST_IP" ]; then
  HOST_NETWORK=$(echo "$HOST_IP" | sed 's/\.[0-9]*$/.0\/24/')
  echo "Allowing host network: $HOST_NETWORK"
  iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
  iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT
fi

# デフォルトポリシーを DROP に
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# 確立済み接続を許可
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 許可リスト宛のアウトバウンドを許可
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT

echo "Firewall configured."

# 検証: 許可外は遮断、許可先は到達できることを確認
echo "Verifying firewall..."
if curl --connect-timeout 5 -s https://example.com >/dev/null 2>&1; then
  echo "ERROR: Firewall verification failed - able to reach https://example.com"
  exit 1
else
  echo "OK: https://example.com is blocked as expected"
fi
if ! curl --connect-timeout 5 -s https://api.github.com/zen >/dev/null 2>&1; then
  echo "ERROR: Firewall verification failed - unable to reach https://api.github.com"
  exit 1
else
  echo "OK: https://api.github.com is reachable"
fi
