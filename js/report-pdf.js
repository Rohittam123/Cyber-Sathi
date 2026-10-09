function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function reportDate(timestamp) {
  const date = typeof timestamp?.toDate === "function"
    ? timestamp.toDate()
    : new Date(timestamp || Date.now());
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(date);
}

export function printAnalysisReport(report) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Your browser blocked the report window. Allow pop-ups for this site, then try again.");
  }

  const riskLabels = { low: "Lower risk signals", medium: "Caution advised", high: "High-risk signals" };
  const findings = Array.isArray(report.signals) ? report.signals : [];
  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [report.advice];
  const filenameTitle = `${report.messageType || "Message Safety Report"} - ${reportDate(report.createdAt || report.checkedAt)}`;
  const findingsMarkup = findings.length
    ? findings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")
    : "<li>No common warning categories were detected. This does not prove the message is safe.</li>";
  const recommendationsMarkup = recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const message = typeof report.messageText === "string" && report.messageText.trim()
    ? report.messageText
    : "The original message was not included in this saved report.";

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(`CyberSaathi ${filenameTitle}`)}</title>
        <style>
          *{box-sizing:border-box}body{margin:0;padding:42px;color:#17282a;font:14px/1.6 Arial,sans-serif}
          main{max-width:760px;margin:0 auto}.brand{color:#137759;font-weight:bold;letter-spacing:1px;text-transform:uppercase}
          h1{margin:10px 0 4px;font-size:27px}h2{margin:26px 0 8px;font-size:16px}
          .meta{color:#566665;font-size:12px}.risk{display:inline-block;margin:14px 0 5px;padding:5px 10px;border:1px solid #789;border-radius:20px;font-weight:bold}
          .risk-high{color:#9d382b;border-color:#d9a49c;background:#fff3f0}.risk-medium{color:#76540b;border-color:#d8c17e;background:#fff9df}.risk-low{color:#176246;border-color:#8dc1a9;background:#effaf4}
          .summary{padding:12px 14px;border-left:3px solid #388b6e;background:#f2f7f5}
          pre{margin:0;padding:14px;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #d8e0dd;border-radius:6px;background:#f7f9f8;font:13px/1.6 Arial,sans-serif}
          li{margin:0 0 9px}.disclaimer{margin-top:28px;padding-top:12px;border-top:1px solid #d8e0dd;color:#566665;font-size:11px}
          @media print{body{padding:20px}a{color:inherit}}
        </style>
      </head>
      <body>
        <main>
          <div class="brand">CyberSaathi · Message Safety Report</div>
          <h1>${escapeHtml(report.messageType || "Suspicious message")}</h1>
          <div class="meta">Checked ${escapeHtml(reportDate(report.createdAt || report.checkedAt))}</div>
          <div class="risk risk-${escapeHtml(report.level)}">${escapeHtml(riskLabels[report.level] || "Risk level unavailable")}</div>
          <p class="summary">${escapeHtml(report.summary || "No analysis summary available.")}</p>
          <h2>Original message checked</h2><pre>${escapeHtml(message)}</pre>
          <h2>Detected warning signs</h2><ul>${findingsMarkup}</ul>
          <h2>Recommended next steps</h2><ul>${recommendationsMarkup}</ul>
          <p class="disclaimer">This automated, rule-based report is an educational aid—not a security verdict. A low-risk result does not prove a message is safe, and new scam tactics may not be detected. Verify unexpected requests through official channels. The report was generated locally by CyberSaathi.</p>
        </main>
        <script>window.addEventListener("load",()=>window.print());</script>
      </body>
    </html>`);
  printWindow.document.close();
}
