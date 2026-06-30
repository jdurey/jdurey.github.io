"""models.py — non-interactive wrappers for the four independent vendor families.

Each call is timeout-bounded and failure-tolerant: a slow/flaky/over-quota CLI returns ""
rather than hanging the pipeline. This is what makes the harness safe to run unattended.

Independence is at the VENDOR/TRAINING level (Anthropic / OpenAI / xAI / Google), not just
different prompts — that is what makes "verifier independence" real rather than cosmetic, and
it is the methodological basis of the cross-family K-of-N result.

Invocation patterns mirror an internal CLI fan-out helper.
"""
import json
import os
import re
import subprocess
import tempfile

from common import log

FAMILIES = ["claude", "codex", "grok", "gemini"]
GROK_BIN = os.path.expanduser("~/.grok/bin/grok")

DEFAULT_TIMEOUTS = {"claude": 150, "codex": 200, "grok": 150, "gemini": 150}


def _run(cmd, timeout, stdin_text=None):
    try:
        p = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout,
            input=stdin_text, stdin=None if stdin_text is not None else subprocess.DEVNULL,
        )
        return p.stdout, p.stderr, p.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", 124
    except Exception as e:  # noqa: BLE001 — any CLI failure must degrade, not crash
        return "", f"EXC:{e}", 1


def call_model(family, prompt, timeout=None):
    """Return raw text from the given vendor family, or "" on any failure/timeout."""
    t = timeout or DEFAULT_TIMEOUTS.get(family, 180)
    if family == "claude":
        out, err, rc = _run(["claude", "-p", prompt], t)
        return out
    if family == "grok":
        out, err, rc = _run([GROK_BIN, "-p", prompt], t)
        return out
    if family == "gemini":
        out, err, rc = _run(["agy", "--print-timeout", f"{t-20}s", "-p", prompt], t)
        return out
    if family == "codex":
        # codex writes its FINAL message reliably to -o; stdout/stderr carry only the trace.
        fd, path = tempfile.mkstemp(suffix=".txt")
        os.close(fd)
        try:
            _run(["codex", "exec", "-s", "read-only", "--skip-git-repo-check",
                  "-c", "model_reasoning_effort=low", "-o", path, prompt], t)
            with open(path) as f:
                return f.read()
        finally:
            try:
                os.unlink(path)
            except OSError:
                pass
    raise ValueError(f"unknown family {family}")


def extract_json(text):
    """Pull the first balanced JSON value out of an LLM response. None if not parseable.

    Tolerates markdown fences, leading prose, and trailing chatter — the realistic shapes
    these CLIs emit.
    """
    if not text:
        return None
    # strip code fences
    text = re.sub(r"```(?:json)?", "", text)
    # scan left-to-right; parse a balanced value from each opener, whichever bracket
    # type ('{' or '[') appears first — so a top-level array isn't mistaken for its
    # first object element.
    pos = 0
    while pos < len(text):
        c = text[pos]
        if c in "{[":
            closer = "}" if c == "{" else "]"
            chunk = _balanced(text, pos, c, closer)
            if chunk is not None:
                try:
                    return json.loads(chunk)
                except json.JSONDecodeError:
                    pass
        pos += 1
    return None


def _balanced(text, start, opener, closer):
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        c = text[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == opener:
            depth += 1
        elif c == closer:
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return None


def probe(family):
    """Quick liveness probe: returns True if the family answers a trivial JSON request."""
    out = call_model(family, 'Reply with ONLY this JSON: {"ok": true}', timeout=DEFAULT_TIMEOUTS.get(family, 60))
    j = extract_json(out)
    ok = isinstance(j, dict) and j.get("ok") is True
    log(f"probe {family}: {'OK' if ok else 'NO RESPONSE'} ({len(out)} bytes)")
    return ok


if __name__ == "__main__":
    import sys
    fam = sys.argv[1] if len(sys.argv) > 1 else None
    fams = [fam] if fam else FAMILIES
    for f in fams:
        probe(f)
