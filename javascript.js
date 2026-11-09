const form = document.getElementById("resume-form");
const fields = ["name", "role", "email", "phone", "location", "website", "summary", "experience", "education", "skills", "languages"];
const projectList = document.getElementById("project-list");
const previewProjects = document.getElementById("preview-projects");
const languageSelect = document.getElementById("resume-language");
const formatSelect = document.getElementById("resume-format");
const formatGuidance = document.getElementById("format-guidance");
let nextProjectId = 0;

const resumeTranslations = {
    en: {
        summary: "Profile",
        experience: "Experience",
        education: "Education",
        skills: "Skills",
        projects: "Projects",
        languages: "Languages",
        emptyName: "Your Name",
        emptySummary: "Your professional summary will appear here.",
        emptyExperience: "Add your work history to highlight your experience.",
        emptyEducation: "Add your education and qualifications.",
        emptySkills: "Your skills will appear here.",
        emptyProjects: "Your projects will appear here."
    },
    fr: {
        summary: "Profil",
        experience: "Expérience professionnelle",
        education: "Formation",
        skills: "Compétences",
        projects: "Projets",
        languages: "Langues",
        emptyName: "Votre nom",
        emptySummary: "Votre profil professionnel apparaîtra ici.",
        emptyExperience: "Ajoutez votre expérience professionnelle.",
        emptyEducation: "Ajoutez votre formation et vos diplômes.",
        emptySkills: "Vos compétences apparaîtront ici.",
        emptyProjects: "Vos projets apparaîtront ici."
    },
    es: {
        summary: "Perfil",
        experience: "Experiencia profesional",
        education: "Formación",
        skills: "Competencias",
        projects: "Proyectos",
        languages: "Idiomas",
        emptyName: "Tu nombre",
        emptySummary: "Tu perfil profesional aparecerá aquí.",
        emptyExperience: "Añade tu experiencia profesional.",
        emptyEducation: "Añade tu formación y titulaciones.",
        emptySkills: "Tus competencias aparecerán aquí.",
        emptyProjects: "Tus proyectos aparecerán aquí."
    },
    de: {
        summary: "Profil",
        experience: "Berufserfahrung",
        education: "Ausbildung",
        skills: "Kenntnisse",
        projects: "Projekte",
        languages: "Sprachen",
        emptyName: "Ihr Name",
        emptySummary: "Ihr berufliches Profil erscheint hier.",
        emptyExperience: "Fügen Sie Ihre Berufserfahrung hinzu.",
        emptyEducation: "Fügen Sie Ihre Ausbildung und Abschlüsse hinzu.",
        emptySkills: "Ihre Kenntnisse erscheinen hier.",
        emptyProjects: "Ihre Projekte erscheinen hier."
    }
};

const formatGuidanceByRegion = {
    us: "US resume: concise, achievement-led format on Letter paper. Keep it focused and omit a photo and personal details such as age or marital status.",
    uk: "UK CV: use a clear profile and employment history on A4 paper. A photo and personal details such as age or marital status are not normally needed.",
    europass: "Europass-inspired format: organize work experience, education, skills, and languages on A4 paper. This is a practical layout, not the official Europass template.",
    canada: "Canadian resume: use a concise, tailored format focused on relevant achievements on Letter paper. A photo and personal details such as age or marital status are generally omitted.",
    nigeria: "Nigerian CV: use a clear career profile and work history on A4 paper. Include only relevant contact details; personal details such as age or marital status are optional and usually unnecessary."
};

const formatHeadings = {
    us: { summary: "Summary", experience: "Professional Experience" },
    uk: { summary: "Personal Profile", experience: "Employment History", skills: "Key Skills" },
    europass: { summary: "Profile", experience: "Work Experience", education: "Education and Training", skills: "Personal Skills", languages: "Language Skills" },
    canada: { summary: "Summary", experience: "Work Experience" },
    nigeria: { summary: "Career Profile", experience: "Work Experience", skills: "Core Competencies" }
};

const localizedFormatHeadings = {
    fr: {
        europass: { education: "Formation et éducation", skills: "Compétences personnelles", languages: "Compétences linguistiques" },
        uk: { summary: "Profil personnel", experience: "Expérience professionnelle", skills: "Compétences clés" },
        nigeria: { summary: "Profil professionnel", skills: "Compétences clés" }
    },
    es: {
        europass: { education: "Educación y formación", skills: "Competencias personales", languages: "Competencias lingüísticas" },
        uk: { summary: "Perfil profesional", experience: "Experiencia laboral", skills: "Competencias clave" },
        nigeria: { summary: "Perfil profesional", skills: "Competencias principales" }
    },
    de: {
        europass: { education: "Bildung und Ausbildung", skills: "Persönliche Kompetenzen", languages: "Sprachkenntnisse" },
        uk: { summary: "Persönliches Profil", experience: "Beruflicher Werdegang", skills: "Kernkompetenzen" },
        nigeria: { summary: "Berufliches Profil", skills: "Kernkompetenzen" }
    }
};

function getResumeLabels() {
    const language = resumeTranslations[languageSelect.value] ? languageSelect.value : "en";
    const format = formatSelect.value;
    const labels = { ...resumeTranslations[language] };
    if (language === "en") {
        Object.assign(labels, formatHeadings[format] || {});
    } else {
        Object.assign(labels, localizedFormatHeadings[language]?.[format] || {});
    }
    return labels;
}

function updateResumeSettings() {
    const language = languageSelect.value;
    const format = formatSelect.value;
    const labels = getResumeLabels();
    const paper = document.querySelector(".resume-paper");
    paper.dataset.format = format;
    paper.lang = language;
    document.documentElement.lang = language;
    document.getElementById("preview-summary-heading").textContent = labels.summary;
    document.getElementById("preview-experience-heading").textContent = labels.experience;
    document.getElementById("preview-education-heading").textContent = labels.education;
    document.getElementById("preview-skills-heading").textContent = labels.skills;
    document.getElementById("preview-projects-heading").textContent = labels.projects;
    document.getElementById("preview-languages-heading").textContent = labels.languages;
    formatGuidance.textContent = formatGuidanceByRegion[format];
    updatePreview();
}

languageSelect.addEventListener("change", updateResumeSettings);
formatSelect.addEventListener("change", updateResumeSettings);

function setPreviewText(elementId, value, emptyText) {
    const element = document.getElementById(elementId);
    const text = value.trim();
    element.textContent = text || emptyText;
    element.classList.toggle("is-empty", !text);
}

function getProjectCards() {
    return Array.from(projectList.querySelectorAll(".project-card"));
}

function getJobKeywords(description) {
    const stopWords = new Set([
        "about", "across", "after", "also", "and", "are", "with", "will", "your",
        "from", "have", "that", "this", "their", "they", "what", "when", "where",
        "which", "while", "within", "work", "working", "years", "you", "our",
        "such", "role", "team", "including", "ensure", "ability", "strong", "need",
        "needs", "needed", "seeking", "looking", "required", "requirements"
    ]);
    const frequencies = new Map();
    (description.toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []).forEach((word) => {
        if (!stopWords.has(word)) {
            frequencies.set(word, (frequencies.get(word) || 0) + 1);
        }
    });
    return Array.from(frequencies.entries())
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .slice(0, 12)
        .map(([word]) => word);
}

function getQualityRating(score) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Very Good";
    if (score >= 40) return "Good";
    if (score > 0) return "Getting started";
    return "Needs improvement";
}

function setQualityRating(elementId, rating) {
    const element = document.getElementById(elementId);
    element.textContent = rating;
    element.classList.toggle("is-good", rating === "Good" || rating === "Very Good");
    element.classList.toggle("is-excellent", rating === "Excellent");
}

function estimateSyllables(word) {
    const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!normalized) return 0;
    let syllables = (normalized.match(/[aeiouy]+/g) || []).length;
    if (normalized.length > 2 && /e$/.test(normalized) && !/le$/.test(normalized)) {
        syllables -= 1;
    }
    if (/[^aeiou]le$/.test(normalized)) {
        syllables += 1;
    }
    return Math.max(1, syllables);
}

function updateAnalytics() {
    const values = Object.fromEntries(
        fields.map((name) => [name, form.elements.namedItem(name).value.trim()])
    );
    const projectContent = getProjectCards().map((card) => ({
        title: card.querySelector('[data-project-field="title"]').value.trim(),
        description: card.querySelector('[data-project-field="description"]').value.trim()
    })).filter((project) => project.title || project.description);
    const content = [
        values.summary,
        values.experience,
        values.education,
        values.skills,
        values.languages,
        ...projectContent.flatMap((project) => [project.title, project.description])
    ].filter(Boolean).join(" ");
    const words = content.match(/\b[\p{L}\p{N}]+(?:['’][\p{L}]+)?\b/gu) || [];
    const wordCount = words.length;
    document.getElementById("analytics-word-count").textContent = String(wordCount);

    const actionVerbs = new Set([
        "achieved", "analyzed", "authored", "boosted", "built", "collaborated",
        "coordinated", "created", "delivered", "designed", "developed", "drove",
        "established", "generated", "grew", "implemented", "improved", "increased",
        "launched", "led", "managed", "mentored", "negotiated", "optimized",
        "reduced", "resolved", "researched", "saved", "secured", "streamlined",
        "supported", "transformed"
    ]);
    const actionText = [values.summary, values.experience, ...projectContent.map((project) => project.description)]
        .join(" ").toLowerCase();
    const actionMatches = actionText.match(/\b[a-z]+\b/g) || [];
    const actionCount = actionMatches.filter((word) => actionVerbs.has(word)).length;
    document.getElementById("analytics-action-count").textContent =
        `${actionCount} action ${actionCount === 1 ? "verb" : "verbs"}`;

    const impactText = [values.experience, ...projectContent.map((project) => project.description)]
        .filter(Boolean).join("\n");
    const statements = impactText.split(/[\n.!?]+/).map((part) => part.trim()).filter(Boolean);
    const quantifiedStatements = statements.filter((statement) =>
        /(?:[$£€]\s?\d|\b\d+(?:[,.]\d+)?\s?(?:%|percent\b|k\b|m\b|million\b|billion\b|users?\b|customers?\b|clients?\b|projects?\b|hours?\b|revenue\b|sales\b|tickets?\b|teams?\b|employees?\b))/i.test(statement)
    );
    const achievementDensity = statements.length
        ? Math.round((quantifiedStatements.length / statements.length) * 100)
        : 0;
    document.getElementById("analytics-impact-detail").textContent = statements.length
        ? `${quantifiedStatements.length} of ${statements.length} statements quantified (${achievementDensity}%)`
        : "Add work or project details";

    const proseContent = [
        values.summary,
        values.experience,
        values.education,
        ...projectContent.map((project) => project.description)
    ].filter(Boolean).join(" ");
    const proseWords = proseContent.match(/\b[\p{L}\p{N}]+(?:['’][\p{L}]+)?\b/gu) || [];
    const sentences = proseContent.split(/[.!?]+|\n+/).map((sentence) => sentence.trim()).filter((sentence) => {
        return (sentence.match(/\b[\p{L}\p{N}]+(?:['’][\p{L}]+)?\b/gu) || []).length >= 3;
    });
    const hasReadabilityEstimate = proseWords.length >= 20 && sentences.length >= 2;
    let readingGrade = null;
    let readabilityScore = null;
    let readabilityDescription = "Add a few sentences";
    let readabilityLabel = "Not rated";
    if (hasReadabilityEstimate) {
        const syllables = proseWords.reduce((total, word) => total + estimateSyllables(word), 0);
        readingGrade = Math.max(0, Math.min(18, Math.round(
            0.39 * (proseWords.length / sentences.length) +
            11.8 * (syllables / proseWords.length) -
            15.59
        )));
        readabilityLabel = `Grade ${readingGrade}`;
        readabilityDescription = `Approximate US reading grade · ${
            readingGrade <= 8 ? "Easy" : readingGrade <= 12 ? "Standard" : "Complex"
        }`;
        readabilityScore = readingGrade >= 7 && readingGrade <= 10
            ? 100
            : Math.max(0, 100 - Math.min(100, Math.abs(readingGrade - 8) * 12));
    }
    document.getElementById("analytics-readability").textContent = readabilityLabel;
    document.getElementById("analytics-readability-detail").textContent = readabilityDescription;

    const jobDescription = document.getElementById("job-description").value.trim();
    const jobKeywords = getJobKeywords(jobDescription);
    let keywordScore = null;
    if (jobKeywords.length) {
        const resumeText = `${content} ${values.role}`.toLowerCase();
        const matches = jobKeywords.filter((keyword) => resumeText.includes(keyword)).length;
        keywordScore = Math.round((matches / jobKeywords.length) * 100);
        document.getElementById("analytics-keyword-detail").textContent =
            `${matches} of ${jobKeywords.length} target terms matched (${keywordScore}%)`;
        setQualityRating("analytics-keyword-rating", getQualityRating(keywordScore));
    } else {
        document.getElementById("analytics-keyword-detail").textContent = "Add a job description to compare";
        setQualityRating("analytics-keyword-rating", "Not rated");
    }

    const actionScore = Math.min(100, Math.round((actionCount / Math.max(3, statements.length * 0.5)) * 100));
    const impactScore = statements.length ? achievementDensity : 0;
    const completenessScore = Math.round(
        [values.summary, values.experience, values.education, values.skills].filter(Boolean).length / 4 * 100
    );
    const lengthScore = wordCount === 0 ? 0
        : wordCount < 100 ? Math.round(wordCount / 100 * 45)
            : wordCount < 250 ? Math.round(45 + ((wordCount - 100) / 150) * 55)
                : wordCount <= 800 ? 100
                    : Math.max(35, 100 - Math.round((wordCount - 800) / 25));
    const scoreParts = [
        { score: completenessScore, weight: keywordScore === null ? 0.3 : 0.27 },
        { score: actionScore, weight: keywordScore === null ? 0.25 : 0.225 },
        { score: impactScore, weight: keywordScore === null ? 0.25 : 0.225 },
        { score: lengthScore, weight: keywordScore === null ? 0.1 : 0.09 }
    ];
    if (readabilityScore !== null) {
        scoreParts.push({ score: readabilityScore, weight: keywordScore === null ? 0.1 : 0.09 });
    }
    if (keywordScore !== null) {
        scoreParts.push({ score: keywordScore, weight: 0.1 });
    }
    const availableWeight = scoreParts.reduce((total, part) => total + part.weight, 0);
    const healthScore = Math.round(scoreParts.reduce((total, part) =>
        total + part.score * part.weight, 0
    ) / availableWeight);

    document.getElementById("health-score").style.setProperty("--score", String(healthScore));
    document.getElementById("health-score").setAttribute("aria-valuenow", String(healthScore));
    document.getElementById("health-score").setAttribute("aria-valuetext", `${healthScore} out of 100`);
    document.getElementById("health-score-value").textContent = String(healthScore);
    document.getElementById("health-label").textContent = wordCount === 0
        ? "Add resume details to get started"
        : healthScore >= 85 ? "Excellent foundation"
            : healthScore >= 70 ? "Strong resume"
                : healthScore >= 50 ? "Good progress"
                    : "Room to strengthen";

    setQualityRating("analytics-action-rating", actionCount >= 5 ? "Excellent"
        : actionCount >= 3 ? "Very Good"
            : actionCount > 0 ? "Getting started" : "Needs improvement");
    setQualityRating("analytics-impact-rating", statements.length
        ? getQualityRating(achievementDensity)
        : "Needs improvement");

    const tip = !wordCount
        ? "Add experience, skills, and measurable outcomes to see tailored feedback."
        : !values.experience
            ? "Add your work experience to help employers understand your impact."
            : !quantifiedStatements.length
                ? "Where accurate, add numbers to show the scale or results of your work."
                : actionCount < 3
                    ? "Start experience bullets with specific action verbs such as built, improved, or delivered."
                    : !jobKeywords.length
                        ? "Add a target job description below to check how well your resume matches its keywords."
                        : achievementDensity < 40
                            ? "Look for another result you can quantify, such as growth, savings, or projects delivered."
                            : "Good progress. Review the target keywords and make sure each claim is accurate.";
    document.getElementById("analytics-tip").textContent = tip;
}

function addProject() {
    const projectId = nextProjectId++;
    const card = document.createElement("section");
    card.className = "project-card";
    card.dataset.projectId = String(projectId);
    card.innerHTML = `
        <div class="project-card-heading">
            <strong>Project ${getProjectCards().length + 1}</strong>
            <button class="remove-project-button" type="button" aria-label="Remove project">Remove</button>
        </div>
        <div class="field">
            <label for="project-title-${projectId}">Project name</label>
            <input id="project-title-${projectId}" data-project-field="title" type="text" placeholder="e.g. Portfolio redesign">
        </div>
        <div class="field">
            <label for="project-description-${projectId}">Description</label>
            <textarea id="project-description-${projectId}" data-project-field="description" placeholder="What did you create, and what impact did it have?"></textarea>
        </div>
        <div class="field">
            <label for="project-link-${projectId}">Project link <span>(optional)</span></label>
            <input id="project-link-${projectId}" data-project-field="link" type="url" placeholder="https://example.com">
        </div>
        <div class="field">
            <label for="project-image-${projectId}">Upload a project image <span>(optional)</span></label>
            <input id="project-image-${projectId}" class="project-image-input" data-project-field="image" type="file" accept="image/*">
            <p class="project-upload-status" aria-live="polite">Choose an image to include it in your preview.</p>
        </div>
    `;
    projectList.append(card);
    updatePreview();
}

function updateProjectLabels() {
    getProjectCards().forEach((card, index) => {
        card.querySelector(".project-card-heading strong").textContent = `Project ${index + 1}`;
    });
}

function updatePreview() {
    const values = Object.fromEntries(
        fields.map((name) => [name, form.elements.namedItem(name).value])
    );
    const labels = getResumeLabels();

    setPreviewText("preview-name", values.name, labels.emptyName);
    const role = document.getElementById("preview-role");
    role.textContent = values.role.trim();
    role.hidden = !values.role.trim();

    const contact = document.getElementById("preview-contact");
    contact.replaceChildren();
    [values.email, values.phone, values.location].forEach((value) => {
        const text = value.trim();
        if (text) {
            const item = document.createElement("span");
            item.textContent = text;
            contact.append(item);
        }
    });
    if (values.website.trim()) {
        try {
            const websiteUrl = new URL(values.website.trim());
            if (websiteUrl.protocol === "http:" || websiteUrl.protocol === "https:") {
                const link = document.createElement("a");
                link.href = websiteUrl.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = websiteUrl.hostname;
                contact.append(link);
            }
        } catch {
            const item = document.createElement("span");
            item.textContent = values.website.trim();
            contact.append(item);
        }
    }

    setPreviewText("preview-summary", values.summary, labels.emptySummary);
    setPreviewText("preview-experience", values.experience, labels.emptyExperience);
    setPreviewText("preview-education", values.education, labels.emptyEducation);

    const skills = document.getElementById("preview-skills");
    skills.replaceChildren();
    const skillNames = values.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean);
    if (skillNames.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "resume-copy is-empty";
        emptyMessage.textContent = labels.emptySkills;
        skills.append(emptyMessage);
    } else {
        skillNames.forEach((skill) => {
            const chip = document.createElement("span");
            chip.className = "skill-chip";
            chip.textContent = skill;
            skills.append(chip);
        });
    }

    previewProjects.replaceChildren();
    const projects = getProjectCards().map((card) => ({
        title: card.querySelector('[data-project-field="title"]').value.trim(),
        description: card.querySelector('[data-project-field="description"]').value.trim(),
        link: card.querySelector('[data-project-field="link"]').value.trim(),
        imageUrl: card.dataset.imageUrl || ""
    })).filter((project) => project.title || project.description || project.link || project.imageUrl);

    if (projects.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "resume-copy is-empty";
        emptyMessage.textContent = labels.emptyProjects;
        previewProjects.append(emptyMessage);
    } else {
        projects.forEach((project) => {
            const projectCard = document.createElement("article");
            projectCard.className = "project-preview-card";

            const title = document.createElement("h4");
            title.textContent = project.title || "Untitled project";
            projectCard.append(title);

            if (project.link) {
                try {
                    const url = new URL(project.link);
                    if (url.protocol === "http:" || url.protocol === "https:") {
                        const link = document.createElement("a");
                        link.className = "project-preview-link";
                        link.href = url.href;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.textContent = languageSelect.value === "fr" ? "Voir le projet"
                            : languageSelect.value === "es" ? "Ver proyecto"
                                : languageSelect.value === "de" ? "Projekt ansehen" : "View project";
                        projectCard.append(link);
                    }
                } catch {
                    // An incomplete URL stays in the editor until it becomes valid.
                }
            }

            if (project.description) {
                const description = document.createElement("p");
                description.className = "resume-copy";
                description.textContent = project.description;
                projectCard.append(description);
            }

            if (project.imageUrl) {
                const image = document.createElement("img");
                image.className = "project-preview-image";
                image.src = project.imageUrl;
                image.alt = project.title ? `${project.title} project image` : "Project image";
                projectCard.append(image);
            }

            previewProjects.append(projectCard);
        });
    }

    const languageSection = document.getElementById("preview-languages-section");
    languageSection.hidden = !values.languages.trim();
    document.getElementById("preview-languages").textContent = values.languages.trim();
    updateAnalytics();
}

function revokeProjectImage(card) {
    if (card.dataset.imageUrl) {
        URL.revokeObjectURL(card.dataset.imageUrl);
        delete card.dataset.imageUrl;
    }
}

projectList.addEventListener("input", (event) => {
    if (event.target.matches('[data-project-field="title"], [data-project-field="description"], [data-project-field="link"]')) {
        updatePreview();
    }
});

projectList.addEventListener("change", (event) => {
    if (!event.target.matches('[data-project-field="image"]')) {
        return;
    }

    const input = event.target;
    const card = input.closest(".project-card");
    const status = card.querySelector(".project-upload-status");
    revokeProjectImage(card);

    const file = input.files[0];
    if (!file) {
        status.textContent = "Choose an image to include it in your preview.";
    } else if (!file.type.startsWith("image/")) {
        input.value = "";
        status.textContent = "Please choose a valid image file.";
    } else {
        card.dataset.imageUrl = URL.createObjectURL(file);
        status.textContent = `${file.name} selected. Previewed locally; not uploaded.`;
    }
    updatePreview();
});

projectList.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-project-button");
    if (!removeButton) {
        return;
    }

    const card = removeButton.closest(".project-card");
    revokeProjectImage(card);
    card.remove();
    updateProjectLabels();
    updatePreview();
});

form.addEventListener("input", updatePreview);
document.getElementById("add-project-button").addEventListener("click", addProject);
document.getElementById("print-button").addEventListener("click", () => window.print());

const workspace = document.querySelector(".workspace");
const viewSwitchButtons = Array.from(document.querySelectorAll(".view-switch-button"));

viewSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const showPreview = button.dataset.view === "preview";
        workspace.classList.toggle("mobile-preview-active", showPreview);
        viewSwitchButtons.forEach((viewButton) => {
            const isActive = viewButton === button;
            viewButton.classList.toggle("is-active", isActive);
            viewButton.setAttribute("aria-pressed", String(isActive));
        });
    });
});

function getResumeText() {
    const values = Object.fromEntries(
        fields.map((name) => [name, form.elements.namedItem(name).value.trim()])
    );
    const labels = getResumeLabels();
    const lines = [
        values.name || "Your Name",
        values.role,
        [values.email, values.phone, values.location, values.website].filter(Boolean).join(" | ")
    ].filter(Boolean);

    [
        [labels.summary, values.summary],
        [labels.experience, values.experience],
        [labels.education, values.education],
        [labels.skills, values.skills],
        [labels.languages, values.languages]
    ].forEach(([heading, content]) => {
        if (content) {
            lines.push("", heading, content);
        }
    });

    const projects = getProjectCards().map((card) => ({
        title: card.querySelector('[data-project-field="title"]').value.trim(),
        description: card.querySelector('[data-project-field="description"]').value.trim(),
        link: card.querySelector('[data-project-field="link"]').value.trim()
    })).filter((project) => project.title || project.description || project.link);

    if (projects.length) {
        lines.push("", labels.projects);
        projects.forEach((project) => {
            lines.push(project.title || "Untitled project");
            if (project.description) lines.push(project.description);
            if (project.link) lines.push(project.link);
        });
    }

    return lines.join("\n");
}

function escapePortfolioHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function portfolioText(value) {
    return escapePortfolioHtml(value).replace(/\r\n?|\n/g, "<br>");
}

function getPortfolioUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

function toPortfolioSlug(value) {
    return value.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48)
        .replace(/-+$/g, "");
}

function readPortfolioImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }
        if (!/^image\/(?:avif|gif|jpe?g|png|webp)$/i.test(file.type)) {
            reject(new Error(`${file.name} is not a supported raster image. Choose a PNG, JPEG, GIF, WebP, or AVIF image.`));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error(`${file.name} is larger than 5 MB. Remove it or choose a smaller image.`));
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
                resolve(reader.result);
            } else {
                reject(new Error(`Could not read ${file.name} as an image.`));
            }
        });
        reader.addEventListener("error", () => reject(new Error(`Could not read ${file.name}.`)));
        reader.readAsDataURL(file);
    });
}

function createPortfolioHtml(values, projects) {
    const labels = getResumeLabels();
    const language = languageSelect.value;
    const title = values.name || labels.emptyName;
    const description = values.summary || values.role || "A selection of experience, skills, and projects.";
    const contactItems = [];

    if (values.location) {
        contactItems.push(`<span>${escapePortfolioHtml(values.location)}</span>`);
    }
    if (values.email) {
        const email = escapePortfolioHtml(values.email);
        contactItems.push(`<a href="mailto:${email}">${email}</a>`);
    }
    if (values.phone) {
        const phone = escapePortfolioHtml(values.phone);
        const tel = values.phone.replace(/[^\d+*#]/g, "");
        contactItems.push(`<a href="tel:${escapePortfolioHtml(tel)}">${phone}</a>`);
    }
    const website = getPortfolioUrl(values.website);
    if (website) {
        contactItems.push(`<a href="${escapePortfolioHtml(website)}" target="_blank" rel="noopener noreferrer">Website</a>`);
    }

    const sections = [];
    [
        [labels.summary, values.summary],
        [labels.experience, values.experience],
        [labels.education, values.education]
    ].forEach(([heading, content]) => {
        if (content) {
            sections.push(`<section><h2>${escapePortfolioHtml(heading)}</h2><p>${portfolioText(content)}</p></section>`);
        }
    });

    const skills = values.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean);
    if (skills.length) {
        sections.push(`<section><h2>${escapePortfolioHtml(labels.skills)}</h2><ul class="tags">${skills
            .map((skill) => `<li>${escapePortfolioHtml(skill)}</li>`).join("")}</ul></section>`);
    }

    if (projects.length) {
        sections.push(`<section><h2>${escapePortfolioHtml(labels.projects)}</h2><div class="projects">${projects.map((project) => {
            const projectLink = getPortfolioUrl(project.link);
            const projectTitle = project.title || "Project";
            return `<article class="project-card">${project.image
                ? `<img src="${escapePortfolioHtml(project.image)}" alt="${escapePortfolioHtml(projectTitle)}">`
                : ""}<h3>${escapePortfolioHtml(projectTitle)}</h3>${project.description
                ? `<p>${portfolioText(project.description)}</p>` : ""}${projectLink
                ? `<a href="${escapePortfolioHtml(projectLink)}" target="_blank" rel="noopener noreferrer">View project</a>` : ""}</article>`;
        }).join("")}</div></section>`);
    }

    if (values.languages) {
        sections.push(`<section><h2>${escapePortfolioHtml(labels.languages)}</h2><p>${portfolioText(values.languages)}</p></section>`);
    }

    return `<!DOCTYPE html>
<html lang="${escapePortfolioHtml(language)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapePortfolioHtml(description.slice(0, 160))}">
<title>${escapePortfolioHtml(title)}${values.role ? ` | ${escapePortfolioHtml(values.role)}` : ""}</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#182338;background:#f4f6fb;font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}body{margin:0;min-width:320px}.site-shell{width:min(920px,100%);margin:0 auto;padding:56px 28px 72px}
header{padding:0 0 28px;border-bottom:3px solid #5267d8}.eyebrow{margin:0 0 12px;color:#5267d8;font-size:12px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
h1{margin:0;color:#1a2740;font-size:clamp(34px,7vw,58px);letter-spacing:-.05em;line-height:1.04;overflow-wrap:anywhere}
.role{margin:10px 0 0;color:#5267d8;font-size:19px;font-weight:650}.contact{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:18px;color:#68758b;font-size:13px}
a{color:#465feb;text-decoration:none}a:hover{text-decoration:underline}.intro{max-width:720px;margin:26px 0 0;color:#536078;font-size:15px;line-height:1.8}
section{margin-top:34px}section h2{margin:0 0 12px;color:#263650;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
section p{margin:0;color:#536078;font-size:14px;line-height:1.8;overflow-wrap:anywhere}.tags{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.tags li{padding:7px 10px;border-radius:7px;background:#eef1ff;color:#485bbd;font-size:12px;font-weight:650}.projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px}
.project-card{overflow:hidden;padding:16px;border:1px solid #e4e9f1;border-radius:12px;background:#fff}.project-card img{display:block;width:100%;max-height:210px;margin-bottom:12px;border-radius:8px;object-fit:cover}
.project-card h3{margin:0 0 8px;color:#263650;font-size:15px}.project-card p{margin-bottom:10px;font-size:13px}.project-card>a{font-size:12px;font-weight:700}
footer{margin-top:48px;padding-top:16px;border-top:1px solid #e4e9f1;color:#8792a4;font-size:11px}
@media(max-width:520px){.site-shell{padding:36px 20px 52px}.contact{gap:8px 12px}}
@media print{body{background:#fff}.site-shell{padding:0}section,.project-card{break-inside:avoid}}
</style>
</head>
<body>
<main class="site-shell">
<header><p class="eyebrow">Portfolio</p><h1>${escapePortfolioHtml(title)}</h1>${values.role
        ? `<p class="role">${escapePortfolioHtml(values.role)}</p>` : ""}${contactItems.length
        ? `<div class="contact">${contactItems.join("")}</div>` : ""}</header>
${values.summary ? `<p class="intro">${portfolioText(values.summary)}</p>` : ""}
${sections.join("\n")}
<footer>Created with Resume Studio</footer>
</main>
</body>
</html>`;
}

const portfolioSlugInput = document.getElementById("portfolio-slug");
const portfolioGenerateButton = document.getElementById("generate-portfolio");
const portfolioDownloadButton = document.getElementById("download-portfolio");
const portfolioOutput = document.getElementById("portfolio-output");
const portfolioPreview = document.getElementById("portfolio-preview");
const portfolioStatus = document.getElementById("portfolio-status");
let portfolioSlugWasEdited = false;
let generatedPortfolioHtml = "";
let generatedPortfolioUrl = "";

portfolioSlugInput.addEventListener("input", () => {
    portfolioSlugWasEdited = true;
    portfolioSlugInput.value = toPortfolioSlug(portfolioSlugInput.value);
});
form.elements.namedItem("name").addEventListener("input", () => {
    if (!portfolioSlugWasEdited) {
        portfolioSlugInput.value = toPortfolioSlug(form.elements.namedItem("name").value);
    }
});

portfolioGenerateButton.addEventListener("click", async () => {
    portfolioStatus.classList.remove("is-error", "is-success");
    const name = form.elements.namedItem("name").value.trim();
    const slug = toPortfolioSlug(portfolioSlugInput.value || name);
    if (!slug) {
        portfolioStatus.textContent = "Add your name or enter a site name before generating your portfolio.";
        portfolioStatus.classList.add("is-error");
        form.elements.namedItem("name").focus();
        return;
    }

    portfolioSlugInput.value = slug;
    portfolioStatus.textContent = "Generating your standalone website...";
    portfolioGenerateButton.disabled = true;
    try {
        const values = Object.fromEntries(
            fields.map((fieldName) => [fieldName, form.elements.namedItem(fieldName).value.trim()])
        );
        const projects = await Promise.all(getProjectCards().map(async (card) => {
            const imageFile = card.querySelector('[data-project-field="image"]').files[0];
            return {
                title: card.querySelector('[data-project-field="title"]').value.trim(),
                description: card.querySelector('[data-project-field="description"]').value.trim(),
                link: card.querySelector('[data-project-field="link"]').value.trim(),
                image: await readPortfolioImage(imageFile)
            };
        }));
        const populatedProjects = projects.filter((project) =>
            project.title || project.description || getPortfolioUrl(project.link) || project.image
        );
        generatedPortfolioHtml = createPortfolioHtml(values, populatedProjects);
        if (generatedPortfolioUrl) URL.revokeObjectURL(generatedPortfolioUrl);
        generatedPortfolioUrl = URL.createObjectURL(new Blob([generatedPortfolioHtml], { type: "text/html;charset=utf-8" }));
        portfolioPreview.src = generatedPortfolioUrl;
        portfolioOutput.hidden = false;
        portfolioStatus.textContent = `Website generated for preview. Your suggested address is ${slug}.yoursite.com, but it is not published yet. Download the HTML and deploy it with a hosting provider to make it public.`;
        portfolioStatus.classList.add("is-success");
    } catch (error) {
        portfolioStatus.textContent = error instanceof Error
            ? error.message
            : "Could not generate the website. Check the project images and try again.";
        portfolioStatus.classList.add("is-error");
    } finally {
        portfolioGenerateButton.disabled = false;
    }
});

portfolioDownloadButton.addEventListener("click", () => {
    if (!generatedPortfolioHtml) {
        portfolioStatus.textContent = "Generate a website preview before downloading.";
        portfolioStatus.classList.add("is-error");
        return;
    }

    const slug = toPortfolioSlug(portfolioSlugInput.value) || "portfolio";
    const downloadUrl = URL.createObjectURL(new Blob([generatedPortfolioHtml], { type: "text/html;charset=utf-8" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `${slug}-portfolio.html`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    portfolioStatus.textContent = `Downloaded ${slug}-portfolio.html. Upload this file to a hosting provider to publish it.`;
    portfolioStatus.classList.add("is-success");
});

async function copyResumeText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = text;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand("copy");
    temporaryInput.remove();

    if (!copied) {
        throw new Error("Clipboard access is unavailable.");
    }
}

document.getElementById("share-button").addEventListener("click", async () => {
    const status = document.getElementById("action-status");
    const text = getResumeText();
    const title = `Resume - ${form.elements.namedItem("name").value.trim() || "Your Name"}`;

    if (navigator.share) {
        try {
            await navigator.share({ title, text });
            status.textContent = "Resume shared.";
            return;
        } catch (error) {
            if (error.name === "AbortError") {
                status.textContent = "";
                return;
            }
        }
    }

    try {
        await copyResumeText(text);
        status.textContent = "Resume copied. Paste it into a message to share.";
    } catch (error) {
        status.textContent = "Sharing is unavailable in this browser. Try saving as PDF instead.";
    }
});

const workflowSteps = Array.from(document.querySelectorAll(".workflow-step"));
const workflowPanels = Array.from(document.querySelectorAll(".workflow-panel"));
const previousWorkflowButton = document.getElementById("previous-workflow-step");
const nextWorkflowButton = document.getElementById("next-workflow-step");
let activeWorkflowStep = 0;

function showWorkflowStep(step) {
    activeWorkflowStep = Math.max(0, Math.min(step, workflowSteps.length - 1));
    workflowSteps.forEach((button, index) => {
        const isActive = index === activeWorkflowStep;
        button.classList.toggle("is-active", isActive);
        if (isActive) {
            button.setAttribute("aria-current", "step");
        } else {
            button.removeAttribute("aria-current");
        }
    });
    workflowPanels.forEach((panel, index) => {
        panel.hidden = index !== activeWorkflowStep;
    });
    previousWorkflowButton.disabled = activeWorkflowStep === 0;
    nextWorkflowButton.disabled = activeWorkflowStep === workflowSteps.length - 1;
    document.getElementById("workflow-step-count").textContent =
        `Step ${activeWorkflowStep + 1} of ${workflowSteps.length}`;
}

workflowSteps.forEach((button, index) => {
    button.addEventListener("click", () => showWorkflowStep(index));
});
previousWorkflowButton.addEventListener("click", () => showWorkflowStep(activeWorkflowStep - 1));
nextWorkflowButton.addEventListener("click", () => showWorkflowStep(activeWorkflowStep + 1));

document.getElementById("go-to-resume").addEventListener("click", () => {
    document.getElementById("name").focus({ preventScroll: true });
    document.querySelector(".editor").scrollIntoView({ behavior: "smooth", block: "start" });
});

const targetRoleInput = document.getElementById("target-role");
const targetCompanyInput = document.getElementById("target-company");
const jobDescriptionInput = document.getElementById("job-description");
jobDescriptionInput.addEventListener("input", updateAnalytics);

function getResumeSourceText() {
    const values = fields.map((name) => form.elements.namedItem(name).value);
    const projects = getProjectCards().map((card) =>
        Array.from(card.querySelectorAll('[data-project-field]:not([type="file"])'))
            .map((input) => input.value)
            .join(" ")
    );
    return [...values, ...projects].join(" ").toLowerCase();
}

document.getElementById("analyze-resume").addEventListener("click", () => {
    const result = document.getElementById("optimization-result");
    const description = jobDescriptionInput.value.trim();
    if (!description) {
        result.textContent = "Add the job description above first so there are keywords to compare.";
        return;
    }

    const keywords = getJobKeywords(description);

    result.replaceChildren();
    if (!keywords.length) {
        result.textContent = "No useful keywords found. Try adding more of the job description.";
        return;
    }

    const resumeText = getResumeSourceText();
    const matched = keywords.filter((keyword) => resumeText.includes(keyword));
    const missing = keywords.filter((keyword) => !resumeText.includes(keyword));
    const summary = document.createElement("p");
    summary.textContent = `Found ${keywords.length} recurring terms. ${matched.length} appear in your resume; review the rest and add only those that accurately describe your experience.`;
    result.append(summary);

    const groups = document.createElement("div");
    groups.className = "keyword-groups";
    [
        ["Already in your resume", matched, false],
        ["Consider adding if accurate", missing, true]
    ].forEach(([heading, words, isMissing]) => {
        const group = document.createElement("div");
        group.className = "keyword-group";
        const label = document.createElement("strong");
        label.textContent = heading;
        group.append(label);
        if (words.length) {
            const list = document.createElement("div");
            list.className = "keyword-list";
            words.forEach((word) => {
                const chip = document.createElement("span");
                chip.className = `keyword-chip${isMissing ? " is-missing" : ""}`;
                chip.textContent = word;
                list.append(chip);
            });
            group.append(list);
        } else {
            const empty = document.createElement("span");
            empty.textContent = "None yet";
            group.append(empty);
        }
        groups.append(group);
    });
    result.append(groups);
});

document.getElementById("generate-cover-letter").addEventListener("click", () => {
    const applicant = form.elements.namedItem("name").value.trim();
    const role = targetRoleInput.value.trim() || "the position";
    const company = targetCompanyInput.value.trim() || "your organization";
    const summary = form.elements.namedItem("summary").value.trim();
    const experience = form.elements.namedItem("experience").value.trim();
    const skills = form.elements.namedItem("skills").value.trim();
    const opening = summary || experience || skills;
    const paragraphs = [
        `Dear Hiring Team,\n\nI am writing to express my interest in the ${role} position at ${company}.`,
        opening
            ? `\n\n${opening}\n\nI would welcome the opportunity to discuss how my experience could contribute to your team.`
            : "\n\nI am interested in this opportunity and would welcome the chance to discuss how my experience and skills could contribute to your team. Add your professional summary or experience to make this draft more personal.",
        `\n\nThank you for your consideration.\n\n${applicant || "[Your name]"}`
    ];
    document.getElementById("cover-letter-output").value = paragraphs.join("");
    document.getElementById("copy-cover-letter").disabled = false;
    document.getElementById("cover-letter-status").textContent =
        "Draft created. Review and personalize it before sending.";
});

document.getElementById("copy-cover-letter").addEventListener("click", async () => {
    const status = document.getElementById("cover-letter-status");
    try {
        await copyResumeText(document.getElementById("cover-letter-output").value);
        status.textContent = "Cover letter copied to clipboard.";
    } catch (error) {
        status.textContent = "Could not access the clipboard in this browser.";
    }
});

const applicationForm = document.getElementById("application-form");
const applicationList = document.getElementById("application-list");
const applicationStatusMessage = document.getElementById("application-status-message");
const applicationStorageKey = "resume-studio-applications";
const applicationStatuses = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
let applications = [];
let applicationStorageAvailable = true;

function loadApplications() {
    try {
        const saved = localStorage.getItem(applicationStorageKey);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) {
            throw new Error("Saved application data is not a list.");
        }
        return parsed.filter((application) =>
            application &&
            typeof application.id === "string" &&
            typeof application.title === "string" &&
            typeof application.company === "string" &&
            typeof application.date === "string" &&
            applicationStatuses.includes(application.status)
        );
    } catch (error) {
        applicationStorageAvailable = false;
        applicationStatusMessage.textContent =
            "Saved applications could not be loaded. Check this browser's storage settings before tracking new roles.";
        return [];
    }
}

function saveApplications() {
    if (!applicationStorageAvailable) return false;
    try {
        localStorage.setItem(applicationStorageKey, JSON.stringify(applications));
        return true;
    } catch (error) {
        applicationStatusMessage.textContent =
            "Your change is visible for this session, but could not be saved in this browser.";
        return false;
    }
}

function renderApplications() {
    applicationList.replaceChildren();
    if (!applications.length) {
        const empty = document.createElement("p");
        empty.className = "workflow-message";
        empty.textContent = "Your tracked applications will appear here.";
        applicationList.append(empty);
        return;
    }

    applications.forEach((application) => {
        const card = document.createElement("article");
        card.className = "application-card";
        const details = document.createElement("div");
        const title = document.createElement("h4");
        title.textContent = `${application.title} at ${application.company}`;
        const date = document.createElement("p");
        date.textContent = `Applied ${application.date}`;
        details.append(title, date);
        if (application.url) {
            const link = document.createElement("a");
            link.href = application.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View job posting";
            details.append(link);
        }

        const status = document.createElement("select");
        status.setAttribute("aria-label", `Status for ${application.title} at ${application.company}`);
        applicationStatuses.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            option.selected = value === application.status;
            status.append(option);
        });
        status.addEventListener("change", () => {
            application.status = status.value;
            if (saveApplications()) applicationStatusMessage.textContent = "Application status saved.";
        });

        const remove = document.createElement("button");
        remove.className = "remove-application";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${application.title} at ${application.company}`);
        remove.addEventListener("click", () => {
            applications = applications.filter((item) => item.id !== application.id);
            if (saveApplications()) applicationStatusMessage.textContent = "Application removed.";
            renderApplications();
        });

        card.append(details, status, remove);
        applicationList.append(card);
    });
}

applications = loadApplications();
renderApplications();

const applicationDateInput = document.getElementById("application-date");
const today = new Date();
applicationDateInput.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = targetRoleInput.value.trim();
    const company = targetCompanyInput.value.trim();
    if (!title || !company) {
        applicationStatusMessage.textContent = "Enter the target job title and company above before adding this application.";
        (!title ? targetRoleInput : targetCompanyInput).focus();
        return;
    }

    const rawUrl = document.getElementById("application-link").value.trim();
    let url = "";
    if (rawUrl) {
        try {
            const parsedUrl = new URL(rawUrl);
            if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                throw new Error("Only web links can be saved.");
            }
            url = parsedUrl.href;
        } catch (error) {
            applicationStatusMessage.textContent = "Enter a valid http or https job posting URL.";
            document.getElementById("application-link").focus();
            return;
        }
    }

    applications.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        company,
        date: applicationDateInput.value,
        status: document.getElementById("application-status").value,
        url
    });
    renderApplications();
    if (saveApplications()) applicationStatusMessage.textContent = "Application added to your tracker.";
});

const interviewPrompts = document.getElementById("interview-prompts");
function updateInterviewPrompts() {
    const role = targetRoleInput.value.trim() || "this role";
    interviewPrompts.replaceChildren();
    [
        `What interests you about ${role}, and how does it fit your next career step?`,
        "Tell me about a project or challenge that best demonstrates your relevant skills.",
        `What would you focus on during your first 90 days as ${role}?`
    ].forEach((text) => {
        const prompt = document.createElement("p");
        prompt.className = "interview-prompt";
        prompt.textContent = text;
        interviewPrompts.append(prompt);
    });
}
targetRoleInput.addEventListener("input", updateInterviewPrompts);
updateInterviewPrompts();

updateResumeSettings();
addProject();
