import sys, json, base64, time, urllib.request, urllib.error

lines = sys.stdin.read().strip().split("\n")
gh_token, vercel_token = lines[0].strip(), lines[1].strip()

def req(host, method, path, token, data=None, timeout=40):
    r = urllib.request.Request(f"https://{host}{path}", method=method,
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    body = json.dumps(data).encode() if data is not None else None
    try:
        with urllib.request.urlopen(r, data=body, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:400]
    except Exception as e:
        return -1, f"{type(e).__name__}: {e}"[:200]

out = {}
# ---------- Vercel: verify token ----------
s, me = req("api.vercel.com", "GET", "/v2/user", vercel_token)
out["vercel_user"] = me.get("user", {}).get("username", f"HTTP {s}") if s == 200 else f"HTTP {s}"

# ---------- Vercel: deploy static site ----------
html = open("/home/hatch/workspace/qrtconsulting-site/index.html", "rb").read()
b64 = base64.b64encode(html).decode()
s, dep = req("api.vercel.com", "POST", "/v13/deployments", vercel_token, {
    "name": "qrtconsulting-site",
    "files": [{"file": "index.html", "data": b64, "encoding": "base64"}],
    "projectSettings": {"framework": None},
    "target": "production",
})
if s in (200, 201):
    dep_id = dep["id"]
    project_id = dep["projectId"]
    out["deployment_url"] = "https://" + dep.get("url", "")
    state = dep.get("readyState")
    for _ in range(30):
        if state == "READY":
            break
        time.sleep(4)
        s2, d2 = req("api.vercel.com", "GET", f"/v13/deployments/{dep_id}", vercel_token)
        state = d2.get("readyState", state) if s2 == 200 else state
    out["deploy_state"] = state
    for dom in ["qrtconsulting.com", "www.qrtconsulting.com"]:
        s3, d3 = req("api.vercel.com", "POST", f"/v10/projects/{project_id}/domains",
                     vercel_token, {"name": dom})
        out[f"domain_{dom}"] = s3
    out["project_id"] = project_id
else:
    out["deploy_error"] = f"HTTP {s}: {dep}"

# ---------- GitHub: repo + push ----------
s, me = req("api.github.com", "GET", "/user", gh_token)
if s == 200:
    login = me["login"]
    out["github_user"] = login
    repo = "qrtconsulting-site"
    s, _ = req("api.github.com", "POST", "/user/repos", gh_token,
               {"name": repo, "description": "QRT Consulting website", "private": False, "auto_init": False})
    out["gh_create_repo"] = s
    payload = {"message": "Add QRT Consulting website", "content": b64}
    s, res = req("api.github.com", "PUT", f"/repos/{login}/{repo}/contents/index.html", gh_token, payload)
    if s == 422:
        s2, cur = req("api.github.com", "GET", f"/repos/{login}/{repo}/contents/index.html", gh_token)
        payload["sha"] = cur.get("sha") if s2 == 200 else None
        s, res = req("api.github.com", "PUT", f"/repos/{login}/{repo}/contents/index.html", gh_token, payload)
    out["gh_upload"] = s
    if s in (200, 201):
        out["gh_repo_url"] = f"https://github.com/{login}/{repo}"
else:
    out["github_error"] = f"HTTP {s}: {me}"

print(json.dumps(out, indent=1))
