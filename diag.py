import sys, json, urllib.request, urllib.error

token = sys.stdin.read().strip()

def req(method, path, data=None):
    r = urllib.request.Request("https://api.github.com" + path, method=method,
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json",
                 "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"})
    body = json.dumps(data).encode() if data is not None else None
    try:
        with urllib.request.urlopen(r, data=body, timeout=30) as resp:
            return resp.status, resp.read().decode()[:800]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:800]

s, body = req("POST", "/user/repos", {"name": "qrtconsulting-site", "private": False, "auto_init": False})
print("status:", s)
print("body:", body)
