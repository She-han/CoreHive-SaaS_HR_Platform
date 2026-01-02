import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const tabs = [
  "General",
  "Security",
  "Notifications",
  "Integrations",
  "Database",
];

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: THEME.dark }}
                >
                  System Configuration  🧑‍🔧
                </h1>
                <p className="mt-1" style={{ color: THEME.muted }}>
                  Configure global system settings and integrations
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 bg-gray-200 p-1 rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-gray-900 text-sm font-medium transition
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
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
            {activeTab === "General" && <GeneralSettings />}
            {activeTab === "Security" && <SecuritySettings />}
            {activeTab === "Database" && <DatabaseSettings />}
            {activeTab === "Notifications" && <NotificationSettings />}
            {activeTab === "Integrations" && <IntegrationSettings />}
           
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <Input label="System Name" value={form.name} />
        <Input label="System URL" value={form.url} />
        <Input label="Support Email" value={form.email} />
        <Select label="Default Timezone" value={form.timezone} />
      </div>

      <Divider/>

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
            className="flex-1 bg-gray-100 border border-gray-100 rounded-md px-3 py-2 text-sm"
          />
          <button className="border border-gray-400 px-3 py-2 rounded-md text-sm">Copy</button>
          <button className="border border-gray-400 px-3 py-2 rounded-md text-sm">
            Regenerate
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

/* ---------------- NOTIFICATION ---------------- */

function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    slack: false,
    orgRegistration: true,
    criticalErrors: true,
    securityAlerts: true,
    failedPayments: true,
    supportEscalations: false,
    systemUpdates: false
  });

  const toggle = (key) =>
    setSettings({ ...settings, [key]: !settings[key] });

  return (
    <>
      <h2 className="text-lg font-semibold">Notification Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configure system-wide notification preferences
      </p>

      <Toggle
        label="Email Notifications"
        desc="Send email notifications to admins"
        value={settings.email}
        onChange={() => toggle("email")}
      />

      <Toggle
        label="Slack Notifications"
        desc="Send notifications to Slack channels"
        value={settings.slack}
        onChange={() => toggle("slack")}
      />

      <Divider />

      <Toggle
        label="New organization registration"
        value={settings.orgRegistration}
        onChange={() => toggle("orgRegistration")}
      />

      <Toggle
        label="Critical system errors"
        value={settings.criticalErrors}
        onChange={() => toggle("criticalErrors")}
      />

      <Toggle
        label="Security alerts"
        value={settings.securityAlerts}
        onChange={() => toggle("securityAlerts")}
      />

      <Toggle
        label="Failed payment notifications"
        value={settings.failedPayments}
        onChange={() => toggle("failedPayments")}
      />

      <Toggle
        label="Support ticket escalations"
        value={settings.supportEscalations}
        onChange={() => toggle("supportEscalations")}
      />

      <Toggle
        label="System updates available"
        value={settings.systemUpdates}
        onChange={() => toggle("systemUpdates")}
      />

      <Divider />

      <div>
        <label className="block text-sm font-medium mb-2">
          Admin Email Recipients
        </label>
        <input
          defaultValue="admin@corehive.com, support@corehive.com"
          className="w-full border border-gray-200 bg-gray-200 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated list of email addresses
        </p>
      </div>

      <Footer />
    </>
  );
}

/* ---------------- INTEGRATION ---------------- */

function IntegrationSettings() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-6">Integrations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stripe */}
        <IntegrationCard
          title="Stripe"
          desc="Payment processing"
          status="Connected"
        >
          <Input label="Publishable Key" value="pk_live_51JxYz..." />
          <Input label="Secret Key" value="••••••••••••" />
          <IntegrationActions />
        </IntegrationCard>

        {/* SendGrid */}
        <IntegrationCard
          title="SendGrid"
          desc="Email delivery service"
          status="Connected"
        >
          <Input label="API Key" value="••••••••••••" />
          <Input label="From Email" value="noreply@corehive.com" />
          <IntegrationActions />
        </IntegrationCard>

        {/* Slack */}
        <IntegrationCard
          title="Slack"
          desc="Team collaboration"
          status="Not Connected"
        >
          <PrimaryButton text="Connect Slack" />
        </IntegrationCard>

        {/* Google */}
        <IntegrationCard
          title="Google Workspace"
          desc="SSO & Calendar integration"
          status="Not Connected"
        >
          <PrimaryButton text="Connect Google" />
        </IntegrationCard>
      </div>
    </>
  );
}


/* ---------------- DATABASE ---------------- */

function DatabaseSettings() {
  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: "Daily",
    retention: 30
  });

  const createBackup = () => alert("Database backup started");
  const optimizeDatabase = () => alert("Database optimization started");

  return (
    <>
      <SectionHeader
        title="Database Management"
        subtitle="Database backup and maintenance settings"
      />

      <Toggle
        label="Automatic Backups"
        desc="Enable automated database backups"
        value={settings.autoBackup}
        onChange={() =>
          setSettings({ ...settings, autoBackup: !settings.autoBackup })
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Backup Frequency"
          value={settings.frequency}
          options={["Hourly", "Daily", "Weekly"]}
        />
        <NumberInput
          label="Backup Retention (days)"
          value={settings.retention}
        />
      </div>

      <Divider />

      <h3 className="font-medium mb-4">Database Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Size" value="48.2 GB" />
        <StatCard label="Last Backup" value="2h ago" />
        <StatCard label="Total Records" value="1.2M" />
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={createBackup}
          className="border border-gray-200 cursor-pointer bg-gray-200 rounded-md py-2 flex justify-center gap-2 hover:bg-gray-50"
        >
          🗄️ Create Backup Now
        </button>
        <button
          onClick={optimizeDatabase}
          className="border border-gray-200 cursor-pointer bg-gray-200 rounded-md py-2 flex justify-center gap-2 hover:bg-gray-50"
        >
          🔄 Optimize Database
        </button>
      </div>

      <Footer />
    </>
  );
}


/* ---------------- UI COMPONENTS ---------------- */

function SectionHeader({ title, subtitle }) {
  return (
    <>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        className="w-full border border-gray-100 bg-gray-100 rounded-md px-3 py-2 text-sm"
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
        className="w-full bg-gray-100 border border-gray-100 rounded-md px-3 py-2 text-sm"
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
        className="w-full border border-gray-100 bg-gray-100 rounded-md px-3 py-2 text-sm"
      >
        <option>UTC</option>
        <option>GMT</option>
        <option>EST (UTC-5)</option>
        <option>PST (UTC-8)</option>
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
        className={`w-10 h-5 rounded-full transition
          ${value ? "bg-gray-700" : "bg-gray-300"}`}
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full transform transition
            ${value ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function Divider() {
  return <hr className="my-6 border-gray-200" />;
}

function Footer() {
  return (
    <div className="flex justify-end gap-3 mt-8">
      <button className="border border-gray-400 cursor-pointer px-4 py-2 rounded-md text-sm">Reset</button>
      <button className="bg-emerald-500 cursor-pointer text-white px-4 py-2 rounded-md text-sm">
        Save Changes
      </button>
    </div>
  );
}

function IntegrationCard({ title, desc, status, children }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
        <span
          className={`text-xs px-3 py-1 pb-0 rounded-full font-medium
            ${status === "Connected"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function IntegrationActions() {
  return (
    <div className="flex gap-3 mt-3">
      <button className="flex-1 border border-gray-200 bg-gray-100 cursor-pointer px-3 py-2 rounded-md text-sm">
        Configure
      </button>
      <button className="flex-1 border border-gray-200 bg-gray-100 cursor-pointer px-3 py-2 rounded-md text-sm">
        Disconnect
      </button>
    </div>
  );
}

function PrimaryButton({ text }) {
  return (
    <button className="w-full bg-emerald-500 text-white py-2 rounded-md text-sm mt-3">
      {text}
    </button>
  );
}

