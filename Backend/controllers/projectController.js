import Project from './../models/Project.js';
// image handling removed

const createAProject = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { title, ranking, description, link, technologies, title_i18n, description_i18n } = req.body;
        // no image upload

        const techArray = Array.isArray(technologies) ? technologies : technologies?.split(',') || [];

        // Normalize incoming title/description into language maps
        const safeParseObject = (maybeJson) => {
            if (typeof maybeJson === 'string') {
                try { return JSON.parse(maybeJson); } catch { return undefined; }
            }
            return (maybeJson && typeof maybeJson === 'object') ? maybeJson : undefined;
        };

        const parsedTitleI18n = safeParseObject(title_i18n);
        const parsedDescI18n = safeParseObject(description_i18n);

        const buildLangMap = (base, extra) => {
            if (base && typeof base === 'object') {
                return { ...(extra || {}), ...base };
            }
            const trValue = typeof base === 'string' ? base : undefined;
            return { ...(extra || {}), ...(trValue ? { tr: trValue } : {}) };
        };

        const titleMap = buildLangMap(title, parsedTitleI18n);
        const descMap = buildLangMap(description, parsedDescI18n);

        const projectData = {
            title: titleMap,
            description: descMap,
            ranking,
            link,
            // image optional
            technologies: techArray.map(tech => tech.trim())
        }

        const project = Project(projectData);
        await project.save();

        res.status(201).json({ success: true, message: "Project Added" })


    } catch (error) {
        console.log('Failed at createAProject, ', error);
        res.status(400).json({ success: false, message: "Project Add Failed" })
    }
}

const listProject = async (req, res) => {
    try {
        const allProject = await Project.find({}).lean({ getters: false, virtuals: false });
        const toPlainMap = (value) => {
            if (!value) return {};
            if (value instanceof Map) return Object.fromEntries(value);
            return (typeof value === 'object') ? value : {};
        };
        const normalized = allProject.map((obj) => {
            const title = toPlainMap(obj.title);
            const description = toPlainMap(obj.description);
            const title_i18n = obj.title_i18n; // legacy
            const description_i18n = obj.description_i18n; // legacy
            const mergeMap = (baseObj, extra) => ({ ...(extra || {}), ...(baseObj || {}) });
            const titleOut = Object.keys(title).length ? mergeMap(title, title_i18n) : (obj.title && typeof obj.title === 'string' ? { tr: obj.title, ...(title_i18n || {}) } : (title_i18n || {}));
            const descOut = Object.keys(description).length ? mergeMap(description, description_i18n) : (obj.description && typeof obj.description === 'string' ? { tr: obj.description, ...(description_i18n || {}) } : (description_i18n || {}));
            return { ...obj, title: titleOut, description: descOut };
        });
        res.status(201).json({ success: true, projects: normalized });
    } catch (error) {
        console.log('Failed at listProject, ', error);
        res.status(400).json({ success: false, message: "Project List Failed" })
    }
}

const removeProject = async (req, res) => {
    try {
        const { id } = req.params;
        await Project.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Project removed success" });
    } catch (error) {
        console.log('Failed at removeProject, ', error);
        res.status(400).json({ success: false, message: "Project removed Failed" })
    }
}

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, ranking, link, technologies, title_i18n, description_i18n } = req.body;

        // Convert technologies to an array
        const techArray = Array.isArray(technologies) ? technologies : technologies?.split(',') || [];

        // Find the existing project by ID
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project Not Found" });
        }

        // image updates removed

        // Normalize incoming title/description into language maps and merge
        const safeParseObject = (maybeJson) => {
            if (typeof maybeJson === 'string') {
                try { return JSON.parse(maybeJson); } catch { return undefined; }
            }
            return (maybeJson && typeof maybeJson === 'object') ? maybeJson : undefined;
        };

        const parsedTitleI18n = safeParseObject(title_i18n);
        const parsedDescI18n = safeParseObject(description_i18n);

        const buildLangMap = (base, extra) => {
            if (base && typeof base === 'object') {
                return { ...(extra || {}), ...base };
            }
            const trValue = typeof base === 'string' ? base : undefined;
            return { ...(extra || {}), ...(trValue ? { tr: trValue } : {}) };
        };

        const nextTitle = (title || parsedTitleI18n) ? buildLangMap(title, parsedTitleI18n) : undefined;
        const nextDesc = (description || parsedDescI18n) ? buildLangMap(description, parsedDescI18n) : undefined;

        if (nextTitle) project.title = nextTitle;
        if (nextDesc) project.description = nextDesc;
        project.link = link || project.link;
        project.ranking = ranking || project.ranking;
        project.technologies = techArray.map(tech => tech.trim()) || project.technologies;
        // keep existing image if any, no change applied

        // Save the updated project
        await project.save();

        // Return normalized document
        const obj = project.toObject({ flattenMaps: true });
        const toMap = (base, extra) => {
            if (base && typeof base === 'object') return base;
            const trValue = typeof base === 'string' ? base : undefined;
            return { ...(extra || {}), ...(trValue ? { tr: trValue } : {}) };
        };
        const normalized = {
            ...obj,
            title: toMap(obj.title, obj.title_i18n),
            description: toMap(obj.description, obj.description_i18n)
        };

        res.status(200).json({ success: true, message: "Project Updated Successfully", project: normalized });

    } catch (error) {
        console.log('Failed at updateProject, ', error);
        res.status(400).json({ success: false, message: "Project Update Failed" });
    }
};


export { createAProject, listProject, removeProject, updateProject }