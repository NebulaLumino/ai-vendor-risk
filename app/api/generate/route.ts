import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { vendorDescription, dataSensitivity, connectionType, dataFlows } = await req.json();

    if (!vendorDescription) {
      return NextResponse.json({ error: 'Vendor description is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });

    const prompt = `You are an expert third-party risk management (TPRM) and vendor security consultant. Generate a comprehensive vendor risk assessment questionnaire for the following vendor engagement.

VENDOR: ${vendorDescription}
DATA SENSITIVITY: ${dataSensitivity}
CONNECTION TYPE: ${connectionType}
DATA FLOWS: ${dataFlows || 'Not specified'}

Generate a complete vendor risk questionnaire that includes ALL of the following sections, tailored to the data sensitivity level and connection type:

## QUESTIONNAIRE HEADER
- Vendor name, contact information
- Assessment date and version
- Classification level of this assessment
- Instructions for completion

## SECTION 1: COMPANY & CONTACT INFORMATION
- Legal company name and any DBAs
- Headquarters address
- Key contacts (business, technical, security)
- Year founded and company size
- Publicly traded or private
- Regulatory registrations and certifications

## SECTION 2: SECURITY CERTIFICATIONS & COMPLIANCE
Questions about:
- SOC 2 Type II report availability (request date, auditor)
- ISO 27001 certification (scope, expiry date)
- ISO 27701 (privacy extension — relevant for PII)
- SOC 2 report sharing agreement
- GDPR compliance certification
- PCI DSS compliance (if handling payment data)
- HIPAA compliance (if handling health data)
- FedRAMP authorization (if government data)
- Penetration test reports (most recent date, scope, results)
- Bug bounty program existence

## SECTION 3: DATA SECURITY CONTROLS
For data sensitivity: ${dataSensitivity}
Questions about:
- Encryption in transit (TLS version, certificate management)
- Encryption at rest (AES-256 minimum standard)
- Key management (who holds encryption keys, key rotation)
- Data residency and geographic restrictions
- Multi-factor authentication (MFA) for admin access
- SSO / identity provider integration
- VPN or dedicated connectivity
- Data segregation between tenants (for multi-tenant SaaS)
- Endpoint security on vendor systems
- Mobile device management (if applicable)

## SECTION 4: ACCESS CONTROLS & IDENTITY MANAGEMENT
- How is access granted to your organization's data?
- Principle of least privilege — describe access control model
- Role-based access controls (RBAC)
- Privileged access management (PAM)
- Access provisioning and de-provisioning procedures
- How quickly is access revoked when relationship ends?
- Shared vs. individual accounts policy
- Service accounts and API key management

## SECTION 5: INCIDENT RESPONSE & NOTIFICATION
- Do they have a documented incident response plan?
- SLA for notifying you of a data breach (24h? 48h?)
- How do they define a security incident?
- Forensic capabilities in the event of an incident
- Insurance: cyber liability coverage amount
- Past security incidents in the last 3 years (disclosure required)

## SECTION 6: AVAILABILITY & BUSINESS CONTINUITY
- SLA for service uptime (99.9%? 99.99%?)
- Disaster recovery and backup procedures
- RTO (Recovery Time Objective) and RPO (Recovery Point Objective)
- Data backup locations and encryption
- Regular DR testing (how often?)
- Geographic redundancy of infrastructure
- DDoS protection measures

## SECTION 7: VENDOR & SUBCONTROLLER MANAGEMENT
For ${connectionType}:
- Do they use sub-processors / subcontractors?
- Can you pre-approve new sub-processors?
- List of current sub-processors
- Sub-processor agreement requirements
- Offshoring of data processing (locations)

## SECTION 8: CONTRACT & LEGAL REQUIREMENTS
- Willingness to sign a Data Processing Agreement (DPA)?
- Standard contractual clauses for EU data transfers
- Subprocessor liability provisions
- Indemnification clauses
- Insurance requirements (cyber liability minimum)
- Right to audit / assessment rights
- Data return and destruction upon contract termination
- Annual compliance review commitment

## SECTION 9: PRIVACY-SPECIFIC QUESTIONS
(Include if ${dataSensitivity} includes PII or sensitive data)
- Data minimization principle
- Purpose limitation
- Retention and deletion schedules
- Cross-border data transfer mechanisms (SCCs, adequacy decisions, BCRs)
- Privacy by design principles
- Records of processing activities (Article 30 GDPR)

## SECTION 10: SOCIAL & ETHICAL RISK
- Background checks on employees with data access
- Whistleblower policy
- Anti-corruption policy
- Modern slavery statement
- Diversity and ESG commitments

## RISK SCORING MATRIX
After all questions, provide a risk scoring methodology:
- Overall risk rating: Critical / High / Medium / Low
- Scoring criteria for each section
- What triggers an automatic disqualification (e.g., no SOC 2 report for Critical data)
- Remediation requirements for each risk level

## RESPONSE EVALUATION GUIDE
For each section, guidance on what answers indicate acceptable vs. concerning risk levels, and follow-up questions to ask.

Format this as a professional questionnaire that can be sent to vendors. Include Yes/No, free-text, and evidence-request question types.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a senior third-party risk management (TPRM) and vendor security expert. Generate thorough, industry-standard vendor risk questionnaires tailored to the sensitivity of data involved. Reference SOC 2, ISO 27001, GDPR, and PCI DSS frameworks. Include specific evidence requests and scoring guidance.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const output = completion.choices[0]?.message?.content || 'No output generated.';

    return NextResponse.json({ output });
  } catch (err: unknown) {
    console.error('Vendor risk questionnaire generation error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
