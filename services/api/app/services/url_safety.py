from __future__ import annotations

import asyncio
import ipaddress
import socket
from urllib.parse import urljoin, urlsplit, urlunsplit

ALLOWED_SCHEMES = {"http", "https"}
ALLOWED_PORTS = {None, 80, 443}
BLOCKED_HOSTS = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254",
    "100.100.100.200",
}
BLOCKED_SUFFIXES = (".internal", ".local", ".localhost", ".home", ".lan")
MAX_REDIRECTS = 3
MAX_DOWNLOAD_BYTES = 1_000_000


def _normalize_host(hostname: str) -> str:
    return hostname.rstrip(".").lower()


def _is_forbidden_ip(address: ipaddress._BaseAddress) -> bool:
    return (
        not address.is_global
        or address.is_multicast
        or address.is_reserved
        or address.is_unspecified
        or str(address) in BLOCKED_HOSTS
    )


async def _resolve_host(hostname: str) -> set[ipaddress._BaseAddress]:
    loop = asyncio.get_running_loop()
    records = await loop.getaddrinfo(
        hostname,
        None,
        family=socket.AF_UNSPEC,
        type=socket.SOCK_STREAM,
    )
    addresses: set[ipaddress._BaseAddress] = set()
    for record in records:
        sockaddr = record[4]
        addresses.add(ipaddress.ip_address(sockaddr[0]))
    return addresses


async def ensure_public_hostname(hostname: str) -> None:
    normalized = _normalize_host(hostname)
    if normalized in BLOCKED_HOSTS or normalized.endswith(BLOCKED_SUFFIXES):
        raise ValueError("공개 웹 주소만 분석할 수 있습니다.")

    try:
        ip_address = ipaddress.ip_address(normalized)
        addresses = {ip_address}
    except ValueError:
        addresses = await _resolve_host(normalized)

    if not addresses:
        raise ValueError("호스트를 해석할 수 없습니다.")

    for address in addresses:
        if _is_forbidden_ip(address):
            raise ValueError("사설망 또는 내부 네트워크 주소는 분석할 수 없습니다.")


async def validate_public_url(raw_url: str) -> str:
    candidate = raw_url.strip()
    if not candidate:
        raise ValueError("URL을 입력해주세요.")

    parsed = urlsplit(candidate)
    if parsed.scheme not in ALLOWED_SCHEMES:
        raise ValueError("http 또는 https URL만 분석할 수 있습니다.")
    if parsed.username or parsed.password:
        raise ValueError("인증 정보가 포함된 URL은 허용되지 않습니다.")
    if not parsed.hostname:
        raise ValueError("유효한 URL 형식이 아닙니다.")
    if parsed.port not in ALLOWED_PORTS:
        raise ValueError("표준 웹 포트(80/443)만 허용됩니다.")

    await ensure_public_hostname(parsed.hostname)

    netloc = parsed.hostname
    if parsed.port:
        netloc = f"{netloc}:{parsed.port}"

    path = parsed.path or "/"
    return urlunsplit((parsed.scheme, netloc, path, parsed.query, ""))


async def validate_redirect_target(current_url: str, location: str) -> str:
    return await validate_public_url(urljoin(current_url, location))
