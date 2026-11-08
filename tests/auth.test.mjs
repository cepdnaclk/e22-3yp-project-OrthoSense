/* Authentication contract and HTTP behavior checks, using Node's built-in test runner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runtime(fetch, modules = {}) {
  const cache = new Map();
  const events = [];
  const storage = new Map([["orthosense_session_user", JSON.stringify({ role: "admin", email: "forged@example.test" })]]);
  const sandbox = vm.createContext({
    fetch, Headers, FormData, Event, CustomEvent, URL, console,
    process: { env: { NEXT_PUBLIC_API_URL: "http://api.example.test/api/v1" } },
    window: { dispatchEvent: (event) => events.push(event.type) },
    document: { cookie: "orthosense_role=admin" },
    localStorage: { removeItem: (key) => storage.delete(key), getItem: (key) => storage.get(key) },
  });
  function load(file) {
    const filename = path.resolve(__dirname, "..", file);
    if (cache.has(filename)) return cache.get(filename);
    const compiledModule = { exports: {} };
    cache.set(filename, compiledModule.exports);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true },
    }).outputText;
    const requireLocal = (id) => {
      if (Object.hasOwn(modules, id)) return modules[id];
      const target = id.startsWith("@/") ? path.resolve(__dirname, "..", id.slice(2)) : path.resolve(path.dirname(filename), id);
      const file = fs.existsSync(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`;
      return load(path.relative(path.resolve(__dirname, ".."), file));
    };
    vm.runInContext(`(function(require, module, exports) {${code}\n})`, sandbox, { filename })(requireLocal, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  return { load, events, storage };
}

const rawUser = { id: "test-user", email: "clinician@example.test", username: "clinician", full_name: "Test Clinician", role: "CLINICIAN", department: "Research", is_active: true, created_at: "2026-11-08T00:00:00Z" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("server roles map explicitly and unsupported/inactive identities fail closed", () => {
  const { load } = runtime();
  const { normalizeRole, mapAuthUser, ROLE_HOME } = load("lib/services/auth-contract.ts");
  for (const [api, frontend] of [["ADMIN", "admin"], ["CLINICIAN", "doctor"], ["PATIENT", "patient"]]) {
    assert.equal(normalizeRole(api), frontend);
    assert.ok(ROLE_HOME[frontend].startsWith(`/${frontend}`));
  }
  assert.throws(() => normalizeRole("OWNER"));
  assert.throws(() => mapAuthUser({ ...rawUser, is_active: false }));
  assert.equal(mapAuthUser(rawUser).role, "doctor");
});

test("login sends the entered password, includes cookies/CSRF and uses the rotated token", async () => {
  const calls = [];
  const { load } = runtime(async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/auth/csrf/")) return json({ csrfToken: "before-login" });
    if (url.endsWith("/auth/login/")) return json({ user: rawUser, csrfToken: "after-login", expiresAt: "2026-11-09T00:00:00Z" });
    return json({ detail: "ok" });
  });
  const { authService } = load("lib/services/auth-service.ts");
  const session = await authService.login(rawUser.email, "entered-password");
  assert.equal(session.user.role, "doctor");
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[1].options.body).password, "entered-password");
  assert.equal(calls[1].options.headers.get("X-CSRFToken"), "before-login");
  assert.equal(calls[1].options.credentials, "include");
  await authService.logout();
  assert.equal(calls.at(-1).options.headers.get("X-CSRFToken"), "after-login");
});

test("invalid login never returns a demo identity", async () => {
  const { load, storage } = runtime(async (url) => url.endsWith("/auth/csrf/") ? json({ csrfToken: "token" }) : json({ error: "Invalid email or password." }, 401));
  await assert.rejects(load("lib/services/auth-service.ts").authService.login("unknown@example.test", "wrong"), /Invalid email or password/);
  assert.equal(storage.has("orthosense_session_user"), false);
});

test("backend outage never creates an offline authenticated user", async () => {
  const { load } = runtime(async () => { throw new TypeError("Network unavailable"); });
  await assert.rejects(load("lib/services/auth-service.ts").authService.login("admin@example.test", "wrong"), /Network unavailable/);
});

test("expired me clears old cached identity without passwordless reconnection", async () => {
  const calls = [];
  const { load, storage } = runtime(async (url) => { calls.push(url); return json({ detail: "Authentication required." }, 401); });
  assert.equal(await load("lib/services/auth-service.ts").authService.getCurrentUser(), null);
  assert.equal(storage.size, 0);
  assert.ok(calls.every(url => !url.endsWith("/auth/login/")));
  assert.ok(calls[0].endsWith("/auth/me/"));
});

test("session-check outage is distinguishable from an unauthenticated session", async () => {
  const { load } = runtime(async () => { throw new TypeError("Offline"); });
  await assert.rejects(load("lib/services/auth-service.ts").authService.getCurrentUser(), /Offline/);
});

test("non-JSON errors retain the HTTP status without reading the body twice", async () => {
  const { load } = runtime(async () => new Response("<html>Backend unavailable</html>", { status: 502 }));
  await assert.rejects(load("lib/services/api-client.ts").apiClient.get("/patients/"), (error) => error.status === 502 && error.data.includes("Backend unavailable"));
});

test("protected API 401 invalidates session while forbidden 403 remains distinct", async () => {
  let status = 403;
  const { load, events } = runtime(async () => json({ detail: "Denied" }, status));
  const { apiClient } = load("lib/services/api-client.ts");
  await assert.rejects(apiClient.get("/patients/"), (error) => error.status === 403);
  assert.ok(!events.includes("orthosense:session-expired"));
  status = 401;
  await assert.rejects(apiClient.get("/patients/"), (error) => error.status === 401);
  assert.ok(events.includes("orthosense:session-expired"));
});

test("simultaneous first writes share one CSRF bootstrap", async () => {
  let bootstraps = 0;
  const { load } = runtime(async (url) => {
    if (url.endsWith("/auth/csrf/")) { bootstraps++; return json({ csrfToken: "token" }); }
    return json({ detail: "ok" });
  });
  const { apiClient } = load("lib/services/api-client.ts");
  await Promise.all([apiClient.post("/one/", {}), apiClient.post("/two/", {})]);
  assert.equal(bootstraps, 1);
});

test("failed logout remains a failure instead of pretending the server session ended", async () => {
  const { load } = runtime(async (url) => url.endsWith("/auth/csrf/") ? json({ csrfToken: "token" }) : json({ detail: "Unavailable" }, 503));
  await assert.rejects(load("lib/services/auth-service.ts").authService.logout(), (error) => error.status === 503);
});

for (const status of ["loading", "unauthenticated", "error", "wrong-role", "authenticated"]) {
  test(`route guard mounts protected pages only for an authenticated permitted user: ${status}`, () => {
    let mounted = 0;
    const state = { status: status === "wrong-role" ? "authenticated" : status,
      user: status === "wrong-role" ? { role: "patient" } : status === "authenticated" ? { role: "doctor" } : null,
      error: "Session unavailable", refresh: async () => {} };
    const { load } = runtime(undefined, {
      react: React,
      "next/link": ({ children, href }) => React.createElement("a", { href }, children),
      "next/navigation": { useRouter: () => ({ replace: () => {} }) },
      "./AuthProvider": { useAuth: () => state },
    });
    function ProtectedPage() { mounted++; return React.createElement("p", null, "Protected patient data"); }
    const { RequireAuth } = load("components/auth/RequireAuth.tsx");
    const html = renderToStaticMarkup(React.createElement(RequireAuth, { roles: ["doctor"] }, React.createElement(ProtectedPage)));
    assert.equal(mounted, status === "authenticated" ? 1 : 0);
    if (status === "wrong-role") assert.match(html, /Access denied/);
    if (status === "error") assert.match(html, /Retry session check/);
  });
}

 test("pagination follows subsequent pages and preserves missing device evidence", async () => {
  let calls = 0;
  const device = { id: "d", mac_address: "m", device_identifier: "serial", firmware_version: "v", status: "ACTIVE", battery_percent: null, last_seen_at: null, assigned_patient: null, sensor_channels: [] };
  const { load } = runtime(async () => { calls++; return json({ count: 2, next: calls === 1 ? "http://api.example.test/api/v1/devices/?page=2" : null, previous: null, results: [{ ...device, id: String(calls) }] }); });
  const devices = await load("lib/services/api.ts").devicesApi.getAll();
  assert.equal(devices.length, 2);
  assert.equal(devices[0].status, "unknown");
  assert.equal(devices[0].batteryPercent, null);
  assert.equal(devices[0].lastSeenAt, null);
  assert.equal(devices[0].sensorHealth.imuThigh, "unverified");
 });
 test("pagination cannot forward credentials to a foreign host", async () => {
  const { load } = runtime(async () => json({ count: 2, results: [], next: "https://untrusted.example/page" }));
  await assert.rejects(load("lib/services/api.ts").patientsApi.getAll(), /another origin/);
 });

test("patient profile writes preserve supported personal fields and return saved identity", async () => {
  let sent;
  const {load}=runtime(async (url,options) => {
    if(url.endsWith("/auth/csrf/")) return json({csrfToken:"token"});
    sent=JSON.parse(options.body);
    return json({...rawUser,role:"PATIENT",full_name:sent.full_name});
  });
  const saved=await load("lib/services/api.ts").patientProfileApi.update({full_name:"Patient name",emergency_contact_phone:"123"});
  assert.equal(saved.full_name,"Patient name");
  assert.equal(sent.emergency_contact_phone,"123");
  assert.equal(sent.role,undefined);
});
test("exercise catalog preserves server defaults and real media URLs", async () => {
  const {load}=runtime(async () => json([{id:"exercise",name:"Movement",target_joint:"Knee",description:"Instructions",target_angle_min_deg:0,target_angle_max_deg:80,default_repetitions:6,default_sets:2,rest_interval_seconds:45,video_url:"https://example.test/demo.mp4",thumbnail_url:""}]));
  const exercises=await load("lib/services/api.ts").exercisesApi.getAll();
  assert.equal(exercises[0].defaultSets,2);
  assert.equal(exercises[0].videoUrl,"https://example.test/demo.mp4");
});
