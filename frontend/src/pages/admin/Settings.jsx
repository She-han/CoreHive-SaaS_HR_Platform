import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const tabs = [
  "General",
  "Security",
  "Notifications",
  "Integrations",
  "Database",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">

          </div>
          

          {/* Tabs */}
          <div className="flex gap-2 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6 bg-white border rounded-xl p-6">
            {activeTab === "General" && <GeneralSettings />}
            {activeTab === "Security" && <SecuritySettings />}
            {activeTab !== "General" && activeTab !== "Security" && (
              <p className="text-gray-500">Coming soon…</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}

/* ---------------- GENERAL ---------------- */

function GeneralSettings() {
  const [form, setForm] = useState({
    name: "CoreHive",
    url: "https://app.corehive.com",
    email: "support@corehive.com",
    timezone: "UTC",
    maintenance: false,
    autoUpdate: true,
    registrations: true,
  });

  return (
    <>
      <h2 className="text-lg font-semibold">General Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configure basic system settings
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="System Name" value={form.name} />
        <Input label="System URL" value={form.url} />
        <Input label="Support Email" value={form.email} />
        <Select label="Default Timezone" value={form.timezone} />
      </div>

      <Divider />

      <Toggle
        label="Maintenance Mode"
        desc="Put the system in maintenance mode for all users"
        value={form.maintenance}
        onChange={() => setForm({ ...form, maintenance: !form.maintenance })}
      />

      <Toggle
        label="Auto-Update System"
        desc="Automatically install system updates"
        value={form.autoUpdate}
        onChange={() => setForm({ ...form, autoUpdate: !form.autoUpdate })}
      />

      <Toggle
        label="Allow New Registrations"
        desc="Allow new organizations to self-register"
        value={form.registrations}
        onChange={() =>
          setForm({ ...form, registrations: !form.registrations })
        }
      />

      <Footer />
    </>
  );
}

/* ---------------- SECURITY ---------------- */

function SecuritySettings() {
  const [settings, setSettings] = useState({
    twoFA: false,
    passwordExpiry: true,
    ipWhitelist: false,
    sessionTimeout: 60,
    maxAttempts: 5,
    lockout: 30,
    apiKey: "sk_live_51JxYz...",
  });

  return (
    <>
      <h2 className="text-lg font-semibold">Security Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configure security and authentication settings
      </p>

      <Toggle
        label="Require Two-Factor Authentication"
        desc="Enforce 2FA for all admin users"
        value={settings.twoFA}
        onChange={() => setSettings({ ...settings, twoFA: !settings.twoFA })}
      />

      <Toggle
        label="Password Expiration"
        desc="Require password change every 90 days"
        value={settings.passwordExpiry}
        onChange={() =>
          setSettings({ ...settings, passwordExpiry: !settings.passwordExpiry })
        }
      />

      <Toggle
        label="IP Whitelisting"
        desc="Restrict admin access to specific IP addresses"
        value={settings.ipWhitelist}
        onChange={() =>
          setSettings({ ...settings, ipWhitelist: !settings.ipWhitelist })
        }
      />

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput
          label="Session Timeout (minutes)"
          value={settings.sessionTimeout}
        />
        <NumberInput label="Max Login Attempts" value={settings.maxAttempts} />
        <NumberInput
          label="Account Lockout Duration (minutes)"
          value={settings.lockout}
        />
      </div>

      <Divider />

      <div>
        <label className="block text-sm font-medium mb-2">API Key</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={settings.apiKey}
            className="flex-1 bg-gray-100 border rounded-md px-3 py-2 text-sm"
          />
          <button className="border px-3 py-2 rounded-md text-sm">Copy</button>
          <button className="border px-3 py-2 rounded-md text-sm">
            Regenerate
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}

function NumberInput({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        value={value}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}

function Select({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        className="w-full border rounded-md px-3 py-2 text-sm"
      >
        <option>UTC</option>
        <option>GMT</option>
        <option>EST</option>
        <option>PST</option>
      </select>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition
          ${value ? "bg-black" : "bg-gray-300"}`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full transform transition
            ${value ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function Divider() {
  return <hr className="my-6" />;
}

function Footer() {
  return (
    <div className="flex justify-end gap-3 mt-8">
      <button className="border px-4 py-2 rounded-md text-sm">Reset</button>
      <button className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm">
        Save Changes
      </button>
    </div>
  );
}
