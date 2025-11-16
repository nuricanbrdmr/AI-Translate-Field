import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    // Multilingual titles by language code, e.g., { tr: "Başlık", en: "Title" }
    title: {
        type: Map,
        of: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    // Multilingual descriptions by language code, e.g., { tr: "...", en: "..." }
    description: {
        type: Map,
        of: String,
        required: true
    },
    ranking: {
        type: Number,
        required: true
    },
    technologies: [
        {
            type: String,
        },
    ],
    link: {
        type: String,
        required: true
    },
}, {
    toObject: { flattenMaps: true },
    toJSON: { flattenMaps: true }
})

const Project = mongoose.models.project || mongoose.model("project", projectSchema);

export default Project;