import { NextRequest, NextResponse } from 'next/server';

let client: any = null;
function getClient() {
  if (!client) {
    const OpenAI = require('openai');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.deepseek.com/v1' });
  }
  return client;
}

export async function POST(req: NextRequest) {
  try {
    const { vendorDetails } = await req.json();
    if (!vendorDetails) return NextResponse.json({ error: 'Vendor details are required' }, { status: 400 });

    const prompt = `You are an expert third-party risk management and vendor security compliance specialist. Perform a comprehensive vendor risk assessment and SLA compliance review.

## Vendor Information:
${vendorDetails}

Please generate a detailed report including:
1. Executive Summary (vendor criticality, overall risk rating, key concerns)
2. Vendor Profile (services, data access, geographic presence, business criticality)
3. Security Posture Assessment (controls, certifications: SOC2, ISO27001, PCI-DSS, HIPAA, GDPR compliance)
4. SLA Compliance Analysis (uptime guarantees, breach notification timelines, data residency, incident response commitments vs industry standards)
5. Risk Taxonomy (inherent risk vs residual risk after controls)
6. Data Access & Privacy Risk (what data they access, PII handling, cross-border transfers, DPA terms)
7. Financial & Operational Risk (contract terms, exclusivity, exit costs, substitutability)
8. Fourth-Party (Nth-party) Risk Assessment (subprocessors, subcontractor dependencies)
9. Risk Matrix & Scoring (CRA: Confidentiality, Integrity, Availability risks — rated High/Medium/Low)
10. Compliance Gap Analysis (against SOC2 Trust Principles, ISO 27001, GDPR Art. 28, CIS Controls)
11. Risk Mitigation Recommendations (contractual clauses to add, controls to require, monitoring)
12. Continuous Monitoring Plan (periodic reassessment cadence, SLA tracking, KPIs)
13. Go/No-Go Recommendation (proceed with vendor, proceed with conditions, reject)

Format with tables for risk scoring, clear section headers, and actionable recommendations.`;

    const openai = getClient();
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an expert in third-party vendor risk management, SLA compliance, and supply chain security.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const report = completion.choices[0].message.content || 'No report generated.';
    return NextResponse.json({ report });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
