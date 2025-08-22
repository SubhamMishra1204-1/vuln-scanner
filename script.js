/*Web Application Vulnerability Scanner (JavaScript)

Built a tool to scan websites for common vulnerabilities (XSS, SQL injection).

Implemented automated scanning and report generation for security teams.*/


// vulnerability-scanner.js
import axios from "axios";
import { writeFileSync } from "fs";

// Payloads for testing
const xssPayloads = [
    "<script>alert(1)</script>",
    "'\"><img src=x onerror=alert(1)>"
];

const sqlPayloads = [
    "' OR '1'='1",
    "\" OR \"1\"=\"1",
    "' UNION SELECT null, null, null--"
];

// Function to test for XSS
async function testXSS(url) {
    let results = [];
    for (let payload of xssPayloads) {
        try {
            const res = await axios.get(`${url}?q=${encodeURIComponent(payload)}`);
            if (res.data.includes(payload)) {
                results.push({ payload, vulnerable: true });
            } else {
                results.push({ payload, vulnerable: false });
            }
        } catch (err) {
            results.push({ payload, error: err.message });
        }
    }
    return results;
}

// Function to test for SQLi
async function testSQLi(url) {
    let results = [];
    for (let payload of sqlPayloads) {
        try {
            const res = await axios.get(`${url}?id=${encodeURIComponent(payload)}`);
            if (
                res.data.includes("sql") ||
                res.data.includes("syntax") ||
                res.data.includes("database")
            ) {
                results.push({ payload, vulnerable: true });
            } else {
                results.push({ payload, vulnerable: false });
            }
        } catch (err) {
            results.push({ payload, error: err.message });
        }
    }
    return results;
}

// Main Scanner
async function scan(targetUrl) {
    console.log(`\n🔎 Scanning ${targetUrl} for vulnerabilities...`);
    let report = {};

    report.xss = await testXSS(targetUrl);
    report.sqli = await testSQLi(targetUrl);

    console.log("✅ Scan complete. Saving report...");
    writeFileSync("scan-report.json", JSON.stringify(report, null, 2));

    console.log("📄 Report saved to scan-report.json");
}

// Run
const target = process.argv[2];
if (!target) {
    console.error("❌ Please provide a URL. Example: node vulnerability-scanner.js http://example.com/search");
    process.exit(1);
}
scan(target);
