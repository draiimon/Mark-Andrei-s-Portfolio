# Homepage content research

Reviewed September 8, 2026. Scope: professional homepage wording based on Mark Andrei Castillo's supplied resume. The resume PDF is separate and must remain unchanged.

## Sources and application

| Reference | Relevant finding | Application to this homepage |
| --- | --- | --- |
| [GitHub: Using your GitHub profile to enhance your resume](https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume) | A short professional bio identifies the person and the work they seek. Relevant projects should be easy to understand and explore. | Put career direction in the overview. Keep project details in the project and experience sections. |
| [Harvard: Creating a Strong Resume](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/) | Career writing should be specific, factual, concise, and easy to scan. | Use the supplied qualifications and technologies. Avoid unsupported claims about expertise, scale, reliability, or impact. This is resume guidance; its formatting rules are not universal portfolio requirements. |
| [Harvard: AI for Resumes and Cover Letters](https://careerservices.fas.harvard.edu/ai-resumes-and-cover-letters/) | Start with the person's own experience and revise generated wording for accuracy and authenticity. | Use the supplied professional summary as the basis. Remove invented personal motivations and generic narrative filler. |
| [Harvard: Portfolio Tools](https://careerservices.fas.harvard.edu/resources/portfolio-tools/) | A portfolio presents skills and accomplishments, including technical projects and research. | Support the overview with existing work and project evidence instead of copying the entire resume into the introduction. |
| [Nielsen Norman Group: Concise, Scannable, and Objective](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/) | Their web-reading study found usability advantages for concise, scannable, objective copy. | Keep the overview short and remove promotional language. The study is historical and is not evidence of developer hiring outcomes. |
| [Brittany Chiang's portfolio](https://brittanychiang.com/) | The site identifies a role early and separates the introduction, work experience, and projects. | Reference for information hierarchy and specific descriptions, not wording to copy. Its first-person voice is not the user's requested voice. |
| [Lee Robinson's website](https://leerob.com/) | A short biography identifies the author's work and provides direct supporting links. | Reference for brevity and concrete context. Do not imitate a senior professional's level of experience. |

## Editorial decisions

- Use a formal professional overview with a clear career direction and supporting technical background.
- Use the user's resume as the factual source. Research informs presentation, not personal qualifications.
- Preserve the distinction between career interests and experience already obtained.
- Keep detailed employer and project narratives in their existing sections.
- Avoid stock phrases such as “passionate about innovation,” “cutting-edge solutions,” “proven track record,” and “solving real-world problems.”
- Do not invent metrics, users, certifications, job titles, or proficiency levels.
- Keep contact details concise. References and their personal contact details do not belong in this homepage overview.
- Preserve the existing home layout and separate resume document during this content pass.

These are editorial judgments informed by the sources, not a claim that one portfolio format guarantees interviews.

## PanicSense correction

The owner subsequently corrected the supplied resume and provided the exact featured description and stack saved in `src/data/panicsense-feature.json`. That correction takes precedence over the resume.

Source inspection used repository commit `b19237a09f95fd5c98d5a602cec72bc5c23269bf`:

- [Package manifest](https://github.com/draiimon/Thesis-PanicSense/blob/b19237a09f95fd5c98d5a602cec72bc5c23269bf/package.json): React, TypeScript, Express, PostgreSQL client, and the Node application scripts.
- [Python processing](https://github.com/draiimon/Thesis-PanicSense/blob/b19237a09f95fd5c98d5a602cec72bc5c23269bf/server/python/process.py): Groq-backed real-time analysis and rule-based fallbacks. The inspected processing code did not implement the previously claimed mBERT/Bi-GRU/LSTM stack.
- [Groq integration](https://github.com/draiimon/Thesis-PanicSense/blob/b19237a09f95fd5c98d5a602cec72bc5c23269bf/server/python/groq_compound.py): language handling for English, Tagalog, and Taglish and emotion classification prompts.
- [Repository tree](https://github.com/draiimon/Thesis-PanicSense/tree/b19237a09f95fd5c98d5a602cec72bc5c23269bf): no Terraform configuration files in the checked revision. Deployment guidance is not proof of live hosting infrastructure.

The first visual redesign was rejected and reverted. The owner later requested the original cloud background's depth and a refreshed chatbot interface while keeping the homepage layout. The owner also explicitly requested restoring the original per-page-load view-counting logic; the added visit filters, session table, and database guard were removed.
