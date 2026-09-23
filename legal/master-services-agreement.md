# Master Services Agreement

> **DRAFT for review by counsel. This is not legal advice.** Square-bracketed items `[like this]` are placeholders or business decisions. Notes in *italics* explain the reasoning and should be deleted before sending.

This Master Services Agreement (the **"Agreement"**) is entered into as of [Effective Date] between **Deskside LLC**, a [State] limited liability company with offices at [Address] (**"Deskside"**), and **[Client legal name]**, a [jurisdiction and entity type] with offices at [Address] (**"Client"**). Each is a **"Party."**

---

## 1. Definitions

- **"Affiliate"** means an entity that controls, is controlled by, or is under common control with a Party.
- **"Client Data"** means all data and information that Client or its Affiliates, personnel, or third-party providers make available to Deskside, or that Deskside accesses, processes, or generates from it, in connection with the Services. This includes positions, portfolio and trading information, research, models, communications, call recordings and transcripts, licensed third-party data, and personal information. Client Data includes all outputs derived from Client Data.
- **"Client Environment"** means computing infrastructure owned, leased, or controlled by Client, including Client's cloud accounts.
- **"Confidential Information"** has the meaning in Section 6.
- **"Deliverables"** means software, configurations, prompts, evaluation sets, documentation, and other materials that Deskside creates specifically for Client under a Statement of Work.
- **"Deskside Materials"** means Deskside's pre-existing or independently developed tools, libraries, frameworks, templates, and general know-how that don't contain Client Data or Client Confidential Information.
- **"Model Provider"** means a third-party provider of AI models used in the Services.
- **"Personnel"** means Deskside's employees, members, and approved contractors.
- **"Security Incident"** means any actual or reasonably suspected unauthorized access to, or acquisition, use, disclosure, alteration, or loss of, Client Data.
- **"Services"** means the services described in a Statement of Work.
- **"Statement of Work"** or **"SOW"** means a document in substantially the form of Exhibit A, signed by both Parties.

## 2. Services

2.1 **Statements of Work.** Deskside will perform the Services described in each SOW. Each SOW is governed by this Agreement. If an SOW conflicts with this Agreement, this Agreement controls unless the SOW expressly states that a specific section of this Agreement is being modified.

2.2 **Standard of performance.** Deskside will perform the Services in a professional and workmanlike manner, consistent with generally accepted industry standards, using appropriately skilled Personnel.

2.3 **Client policies.** While on Client premises or accessing Client systems, Deskside Personnel will comply with Client's reasonable written policies that Client provides in advance, including information security, acceptable use, compliance, and personal trading policies.

2.4 **Client responsibilities.** Client will provide timely access to the people, systems, data, and decisions reasonably needed for the Services, and is responsible for maintaining its own licenses to third-party data and software used in the Services (see Section 8).

2.5 **Change requests.** Either Party may request changes to an SOW. Changes that affect scope, fees, or timelines take effect only when both Parties sign a written change order.

## 3. Fees and Payment

3.1 **Fees.** Client will pay the fees in each SOW. Unless an SOW says otherwise, fixed fees are invoiced [50% on signature and 50% on completion], and retainer fees are invoiced monthly in advance.

3.2 **Expenses.** Client will reimburse reasonable, pre-approved travel and out-of-pocket expenses at cost, with receipts.

3.3 **Payment terms.** Invoices are due within [30] days of receipt. Undisputed late amounts accrue interest at the lesser of [1%] per month or the maximum rate allowed by law. Client will notify Deskside of any good-faith dispute within [15] days of receipt, and the Parties will work to resolve it promptly.

3.4 **Taxes.** Fees exclude taxes. Client is responsible for applicable sales, use, and similar taxes, excluding taxes on Deskside's income.

## 4. Client Data and Privacy

*This section is the core of Deskside's privacy promise. Each commitment is specific and testable, which is what fund compliance and security teams look for.*

4.1 **Ownership.** As between the Parties, Client owns all Client Data. Nothing in this Agreement gives Deskside any right, title, or interest in Client Data, except the limited right in Section 4.2.

4.2 **Use only for Client.** Deskside will access, use, and process Client Data **solely to perform the Services for Client** and in accordance with Client's documented instructions. Deskside will not use Client Data for any other purpose.

4.3 **No model training.** Deskside will not use Client Data, or any output derived from it, to train, fine-tune, evaluate, benchmark, or otherwise improve any AI model or product. This includes Deskside's own models and those of any third party, other than models deployed solely for Client within the Client Environment at Client's written request.

4.4 **No sharing across clients.** Deskside will not disclose Client Data to, or use Client Data for the benefit of, any other client or third party. Deskside will keep Client Data logically separated from the data of all other clients and will never combine it with other clients' data.

4.5 **No sale or commercial use.** Deskside will not sell, rent, license, or otherwise make Client Data available, in any form, including aggregated, anonymized, or de-identified form.

4.6 **Deployment in the Client Environment.** Unless an SOW states otherwise, Deskside will build, run, and store the Deliverables and Client Data within the Client Environment. Deskside will not copy Client Data to Deskside-controlled systems except as strictly necessary for a specific task that Client approves in writing, and will delete any such copy promptly after that task is complete.

4.7 **Model Providers.** Deskside will send Client Data to a Model Provider only:
  (a) if the Model Provider is listed in Exhibit C or approved by Client in writing;
  (b) under enterprise or API terms that prohibit the Model Provider from training on the data; and
  (c) with zero data retention (or the shortest retention the Model Provider offers) where available.

At Client's request, Deskside will use Client's own accounts with Model Providers, or models hosted entirely within the Client Environment.

4.8 **Subprocessors.** Deskside will not engage any third party to process Client Data without Client's prior written consent. Deskside will impose data-protection obligations on each approved subprocessor that are at least as protective as this Section 4, and remains responsible for their performance. The current list is in Exhibit C.

4.9 **Personnel.** Deskside will limit access to Client Data to Personnel who need it to perform the Services. Each of them must be bound by written confidentiality obligations at least as protective as this Agreement, and must be trained on handling confidential and material non-public information. Deskside will remove access promptly when it is no longer needed.

4.10 **Security.** Deskside will maintain the administrative, technical, and physical safeguards described in Exhibit B, and will not materially reduce them during the term.

4.11 **Security Incidents.** Deskside will notify Client without undue delay, and in any event within [48] hours, after becoming aware of a Security Incident. The notice will include the information Deskside has about the nature and scope of the incident. Deskside will promptly:
  - investigate the incident and take reasonable steps to contain and remediate it;
  - cooperate with Client's investigation and any required notifications;
  - not notify third parties about the incident without Client's consent, unless required by law.

4.12 **Legal requests.** If Deskside receives a subpoena, court order, or regulatory request for Client Data, it will, to the extent legally permitted:
  - promptly notify Client;
  - give Client a reasonable opportunity to seek a protective order;
  - disclose only the minimum required.

4.13 **Return and deletion.** Within [30] days after the end of an SOW or of this Agreement, or at any time on Client's request, Deskside will return Client Data in a reasonable format and then securely delete all copies in its possession or control. It will certify deletion in writing. Deskside may keep a copy only if the law requires it; that copy stays subject to this Agreement and will not be used for any other purpose.

4.14 **Audit and assurance.** Deskside will respond to Client's reasonable security and due-diligence questionnaires. On reasonable notice, and no more than once a year (or at any time after a Security Incident), Deskside will provide reasonable evidence of compliance with this Section 4 and Exhibit B.

4.15 **Personal information.** To the extent Client Data includes personal information, Deskside acts as Client's service provider or processor. It will process that information only on Client's instructions and in compliance with applicable data-protection laws, and will sign any additional data-processing terms those laws require.

## 5. Securities Law Matters

*These provisions matter to hedge fund clients. They address MNPI, personal trading, and working for competing funds.*

5.1 **No trading on Client information.** Deskside and its Personnel will not trade in any security, or advise or encourage anyone else to trade, based on Client Confidential Information or any material non-public information obtained in connection with the Services. They will not disclose any such information except as this Agreement permits.

5.2 **Personal trading.** Deskside will maintain a written personal trading policy for Personnel who work on Client engagements. At Client's request, Personnel assigned to Client will comply with Client's personal trading pre-clearance and reporting requirements for the duration of the engagement.

5.3 **MNPI handling.** If Deskside becomes aware that Client Data contains, or that the Services are receiving, information that may be material non-public information about an issuer, Deskside will promptly notify Client's compliance contact and follow Client's instructions. This includes, for example, information surfaced during an expert or management call. Where the Services include automated MNPI flagging, it is a support tool only. Client remains responsible for its compliance program.

5.4 **Information barriers.** Deskside may provide services to other investment firms, including firms that compete with Client. Deskside will maintain information barriers designed to ensure that Client Confidential Information and Client Data are never:
  - used for, disclosed to, or accessible by any other client;
  - used by Personnel working on engagements for another client.

5.5 **Exclusivity (optional).** [If agreed in an SOW, Deskside will not provide substantially similar services to the firms listed in that SOW during the period stated there.]

5.6 **Not an adviser.** Deskside is not an investment adviser or broker-dealer and does not provide investment advice. Client makes all investment decisions and is solely responsible for them. Outputs of the Services are research and analysis tools for Client's professionals to review. They are not recommendations.

## 6. Confidentiality

6.1 **Definition.** "Confidential Information" means non-public information disclosed by one Party (the "Discloser") to the other (the "Recipient") that is marked confidential or that a reasonable person would understand to be confidential. Client Data, Client's positions, strategies, and research, and the terms of this Agreement are Client's Confidential Information, whether or not marked.

6.2 **Obligations.** The Recipient will:
  (a) use the Discloser's Confidential Information only to perform or receive the Services;
  (b) disclose it only to its Personnel and professional advisers who need to know it and are bound by confidentiality obligations at least as protective as this Section;
  (c) protect it with at least the care it uses for its own similar information, and no less than reasonable care.

6.3 **Exclusions.** These obligations don't apply to information that the Recipient can show:
  (a) is or becomes public through no fault of the Recipient;
  (b) was lawfully known to the Recipient without restriction before disclosure;
  (c) is lawfully received from a third party without restriction;
  (d) is independently developed without use of the Discloser's Confidential Information.

These exclusions don't apply to Client Data or personal information.

6.4 **Compelled disclosure.** Section 4.12 applies to legally compelled disclosure of Confidential Information.

6.5 **Duration.** These obligations last during the Agreement and for [5] years after it ends. For trade secrets, Client Data, and information about Client's positions, strategies, or investors, they last for as long as the information remains confidential.

6.6 **Publicity.** Deskside will not use Client's name, logo, or any information identifying Client in marketing, case studies, client lists, or public statements without Client's prior written consent in each instance. Any consented case study will be reviewed and approved by Client before publication.

## 7. Intellectual Property

7.1 **Deliverables.** On full payment of the applicable fees, Deskside assigns to Client all right, title, and interest in the Deliverables, excluding Deskside Materials.

7.2 **Deskside Materials.** Deskside keeps all rights in Deskside Materials. To the extent any Deskside Materials are included in a Deliverable, Deskside grants Client a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, copy, and modify them as part of the Deliverables for Client's and its Affiliates' internal business purposes.

7.3 **Clean separation.** Deskside will not include any Client Data or Client Confidential Information in Deskside Materials. General skills and experience Personnel gain while performing the Services are not Client Data, as long as they are applied without using or disclosing Client Data or Client Confidential Information.

7.4 **Open source.** Deskside will identify open-source components included in Deliverables on request. It will not include components under licenses that would require Client to disclose its proprietary code, unless Client approves in writing.

## 8. Third-Party Data and Systems

8.1 **Client's licenses.** Client is responsible for having the rights needed for Deskside to access and process third-party data and systems for Client. This includes alternative data, research portals, market data, and note-taking or transcription tools.

8.2 **Deskside's compliance.** Deskside will access third-party data and systems only:
  - through methods Client authorizes;
  - within the scope of Client's licenses as Client describes them to Deskside.

Deskside will not use Client's credentials or licensed data for any other purpose or client. If Deskside believes a requested use may exceed Client's license, Deskside will raise it before proceeding.

8.3 **Recording and transcription.** Where the Services process recordings or transcripts of calls, Client is responsible for obtaining any consents required by law or by the relevant expert network or counterparty.

## 9. AI Outputs

9.1 **Nature of outputs.** Outputs generated by AI systems may be incomplete, inaccurate, or out of date. Deskside will design the Deliverables with reasonable safeguards, such as source citations, flagging of unverified or stale inputs, and human-review steps agreed in the SOW. Client is responsible for reviewing outputs before relying on them.

9.2 **No guarantee of results.** Deskside does not guarantee any investment, trading, or financial outcome from use of the Services or Deliverables.

## 10. Warranties

10.1 **Mutual.** Each Party represents that it has the authority to enter into this Agreement and that doing so doesn't breach any other agreement it is bound by.

10.2 **Deskside.** Deskside warrants that:
  (a) the Services will be performed as described in Section 2.2;
  (b) for [30] days after acceptance, each Deliverable will materially conform to its SOW specification, and Deskside will correct any nonconformity reported in that period at no additional charge;
  (c) Deskside will not knowingly introduce malicious code into Client systems;
  (d) Deskside and its Personnel are not subject to any agreement that would prevent them from performing the Services or assigning the Deliverables.

10.3 **Disclaimer.** Except as expressly stated in this Agreement, neither Party makes any other warranties, express or implied, including of merchantability, fitness for a particular purpose, or non-infringement.

## 11. Indemnification

11.1 **By Deskside.** Deskside will defend Client against third-party claims, and pay resulting damages and costs finally awarded or agreed in settlement, to the extent the claims arise from:
  (a) an allegation that a Deliverable or Deskside Materials infringe or misappropriate a third party's intellectual property rights;
  (b) Deskside's breach of Section 4, 5, or 6.

11.2 **By Client.** Client will defend Deskside against third-party claims, and pay resulting damages and costs finally awarded or agreed in settlement, to the extent the claims arise from:
  (a) Client Data or third-party materials that Client provides, or Deskside's authorized use of them in accordance with this Agreement;
  (b) Client's investment decisions or use of outputs.

11.3 **Exclusions.** Section 11.1(a) doesn't apply to claims arising from:
  - Client Data;
  - modifications not made by Deskside;
  - combinations with items Deskside didn't provide;
  - use contrary to the SOW.

11.4 **Process.** The indemnified Party will:
  - give prompt written notice of the claim;
  - give reasonable cooperation;
  - allow the indemnifying Party to control the defense and settlement.

No settlement may impose any obligation or admission on the indemnified Party without its consent.

## 12. Limitation of Liability

12.1 **Exclusion of indirect damages.** Except for Excluded Claims, neither Party is liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits or trading losses, even if advised of their possibility.

12.2 **Cap.** Except for Excluded Claims and Data Claims, each Party's total liability under this Agreement will not exceed the fees paid and payable under this Agreement in the [12] months before the event giving rise to the claim.

12.3 **Data and confidentiality supercap.** Each Party's total liability for breach of Sections 4, 5, or 6 (**"Data Claims"**) will not exceed the greater of [3×] the amount in Section 12.2 or [US$ amount].

*The supercap backs the privacy promise with real money, and funds will expect one. Set it at a level your insurance covers.*

12.4 **Excluded Claims.** Sections 12.1 and 12.2 don't apply to:
  - a Party's indemnification obligations;
  - gross negligence, fraud, or willful misconduct;
  - Client's payment obligations.

## 13. Insurance

During the term and for [1] year after, Deskside will maintain, with reputable insurers:
  - technology errors and omissions (professional liability) insurance of at least [US$ amount] per claim;
  - cyber liability insurance of at least [US$ amount] per claim;
  - commercial general liability insurance of at least [US$ amount] per occurrence.

Deskside will provide certificates on request.

## 14. Term and Termination

14.1 **Term.** This Agreement starts on the Effective Date and continues until terminated. Each SOW has the term stated in it.

14.2 **For convenience.** Either Party may terminate this Agreement or any SOW on [30] days' written notice.

14.3 **For cause.** Either Party may terminate immediately on written notice if the other Party:
  - materially breaches this Agreement and fails to cure within [15] days of notice; or
  - becomes insolvent or subject to bankruptcy proceedings.

Client may terminate immediately if Deskside materially breaches Section 4, 5, or 6.

14.4 **Effect.** On termination:
  (a) Client will pay for Services performed and non-cancellable expenses incurred through the termination date;
  (b) Deskside will deliver work in progress on payment;
  (c) Section 4.13 applies.

Sections 4, 5, 6, 7, 9, 11, 12, 14.4, and 15 survive.

## 15. General

15.1 **Independent contractors.** The Parties are independent contractors. Nothing in this Agreement creates a partnership, joint venture, agency, or employment relationship.

15.2 **Non-solicitation.** During the term and for [12] months after, neither Party will knowingly solicit for employment any employee of the other who was directly involved in the Services. General job postings are excluded.

15.3 **Assignment.** Neither Party may assign this Agreement without the other's written consent, except to a successor in a merger or sale of substantially all its assets that assumes this Agreement in writing. For any assignment by Deskside, Section 4 must continue to apply in full.

15.4 **Governing law and venue.** This Agreement is governed by the laws of the State of [New York], without regard to conflict-of-laws rules. The state and federal courts in [New York County, New York] have exclusive jurisdiction. Either Party may seek injunctive relief in any court of competent jurisdiction to protect its Confidential Information or intellectual property.

15.5 **Notices.** Notices must be in writing and delivered to the addresses above, or by email to the contacts named in the SOW, with confirmation of receipt. Notices of breach or termination must also be sent by courier.

15.6 **Force majeure.** Neither Party is liable for delays caused by events beyond its reasonable control. Payment obligations and Section 4 are excluded.

15.7 **Entire agreement; amendments; waiver; severability; counterparts.** This Agreement, including its Exhibits and SOWs, is the entire agreement between the Parties on its subject matter. It may be amended only in writing signed by both Parties. A failure to enforce a provision is not a waiver. If any provision is unenforceable, the rest remains in effect. This Agreement may be signed electronically and in counterparts.

**Signatures**

| Deskside LLC | [Client] |
|---|---|
| By: ______________________ | By: ______________________ |
| Name: | Name: |
| Title: | Title: |
| Date: | Date: |

---

## Exhibit A: Statement of Work (template)

**SOW No. [X]** under the Master Services Agreement dated [date] between Deskside LLC and [Client].

1. **Engagement type:** [Desk Diagnostic / Deskside Build / Embedded Retainer]
2. **Objective:** [The workflow and the outcome, in one or two sentences.]
3. **Scope and Deliverables:** [For example: a pre-open brief agent for the [X] coverage list, delivered to [channel]; an evaluation set of [N] historical examples; handoff documentation.]
4. **Out of scope:** [Anything explicitly excluded.]
5. **Environment and data:**
   - **Client Environment:** [cloud account or on-premises location]
   - **Client Data in scope:** [list]
   - **Third-party data and licenses relied on:** [list]
   - **Approved Model Providers:** [list, with retention terms]
6. **Human-review steps and safeguards:** [For example: MNPI flags route to [compliance contact]; nothing is sent outside Client without approval.]
7. **Timeline and milestones:** [dates]
8. **Acceptance:** Client will accept or give written reasons for rejection within [10] business days of each milestone delivery. If Client doesn't respond, the milestone is accepted.
9. **Personnel:** [names and roles]; Client contacts: [business, technical, compliance].
10. **Fees:** [fixed fee / monthly retainer], invoiced [schedule]; expense cap [US$].
11. **Exclusivity (optional):** [firms and period, if any]

---

## Exhibit B: Security Measures

Deskside will maintain at least the following measures:

1. **Access control.**
   - Least-privilege access to Client systems and Client Data.
   - Unique named accounts and no shared credentials.
   - Multi-factor authentication on all systems that can access Client Data.
   - Access removed within [24 hours] when no longer needed.
2. **Environment.**
   - Work performed within the Client Environment by default.
   - No Client Data on personal devices or personal accounts.
   - Company-managed devices with full-disk encryption, automatic screen lock, current security patches, and endpoint protection.
3. **Encryption.** Client Data is encrypted in transit (TLS 1.2 or higher) and at rest wherever Deskside stores it.
4. **Secrets.** Credentials and API keys are held in a secrets manager (Client's where available), never in source code, tickets, or chat.
5. **Logging.** Access to Client Data and all AI model calls made by Deliverables are logged, where the Client Environment supports it. Logs are available to Client.
6. **Model Provider controls.**
   - Only approved Model Providers are used, under no-training terms and with zero retention where available.
   - Prompts and outputs are not stored outside the Client Environment.
7. **Secure development.**
   - Code review for all changes.
   - Dependency scanning.
   - No Client Data in test fixtures outside the Client Environment.
   - Synthetic data used for demonstrations.
8. **Personnel.**
   - Background checks where permitted by law.
   - Confidentiality agreements.
   - Annual training on security, confidentiality, and MNPI handling.
   - Written personal trading policy.
9. **Incident response.** A documented incident response plan, including the notification timeline in Section 4.11.
10. **Business continuity.** Deliverables and documentation are held in Client-controlled repositories, so Client can operate them independently of Deskside.
11. **Roadmap.** [Deskside intends to obtain a SOC 2 Type II report by [date].] *Include this only if you commit to it.*

---

## Exhibit C: Approved Model Providers and Subprocessors

| Provider | Purpose | Data processed | Location | Training on data | Retention |
|---|---|---|---|---|---|
| [Model Provider, e.g. via Client's own cloud account] | AI model inference | Prompts and outputs containing Client Data | [Region] | Prohibited | [Zero / N days] |
| [Email / collaboration provider] | Project communications | Business contact details, non-sensitive project communications | [Region] | Prohibited | [Per policy] |

Deskside will give Client [30] days' written notice before adding or replacing a subprocessor. Client may object on reasonable grounds.
