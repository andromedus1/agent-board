import { COMPONENT_ORDER, type DoctorCheck, type DoctorComponent, type DoctorReport } from "../application/doctor.js";

const COMPONENT_LABELS: Readonly<Record<DoctorComponent, string>> = {
  runtime: "Runtime",
  state: "State",
  codex: "Codex",
  claude: "Claude",
  ghostty: "Ghostty",
};
const STATUS_LABELS = {
  info: "ok",
  warning: "warn",
  error: "error",
} as const;

function checksFor(report: DoctorReport, component: DoctorComponent): readonly DoctorCheck[] {
  return report.checks.filter((item) => item.component === component);
}

export function renderDoctor(report: DoctorReport): string {
  const lines = ["AGENT BOARD DOCTOR", ""];
  for (const component of COMPONENT_ORDER) {
    const checks = checksFor(report, component);
    if (checks.length === 0) continue;
    lines.push(COMPONENT_LABELS[component]);
    for (const item of checks) {
      lines.push(`  [${STATUS_LABELS[item.severity]}] ${item.code}: ${item.message}`);
      if (item.remediation !== undefined) lines.push(`    Remediation: ${item.remediation}`);
    }
    lines.push("");
  }
  lines.push(report.ready ? "Ready." : "Not ready.");
  return `${lines.join("\n")}\n`;
}

export function renderDoctorJson(report: DoctorReport): string {
  return `${JSON.stringify(report)}\n`;
}
