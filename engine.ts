document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const exportBtn = document.getElementById('export-pdf-btn');
    const fileInput = document.getElementById('file-upload');
    const resumeTextArea = document.getElementById('raw-resume');

    // File Upload Handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            resumeTextArea.value = e.target.result;
        };
        reader.readAsText(file);
    });

    generateBtn.addEventListener('click', async () => {
        const fullResume = resumeTextArea.value.trim();
        const statusMsg = document.getElementById('status-msg');
        const outputCanvas = document.getElementById('resume-canvas');

        if (!fullResume) {
            statusMsg.innerText = "Error: Please upload or paste your resume.";
            return;
        }

        statusMsg.innerText = "Architecting your masterpiece... Please wait.";
        generateBtn.disabled = true;

        try {
            const endpoint = `https://resume-architect.imkrish5.workers.dev/`;
            
            // The "Million Dollar" Prompt: Acting as an Editor, not just a writer
            const prompt = `You are the world's best resume architect. Rewrite the following resume to be highly professional, impactful, and ATS-optimized. 
            
            Rules:
            1. Keep the exact section structure (Experience, Education, etc).
            2. Rewrite every bullet point to use strong action verbs and quantified impact (e.g., "Increased X by Y%").
            3. Do not add conversational text. 
            4. Output the result in clean, ATS-friendly HTML format.
            
            Resume content: 
            ${fullResume}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;
            
            // Update the whole canvas with the new AI-generated HTML
            document.getElementById('preview-bullets').innerHTML = aiText; 
            
            statusMsg.style.color = '#00ff00';
            statusMsg.innerText = "Success. Resume Optimized.";

        } catch (error) {
            statusMsg.style.color = '#ff4444';
            statusMsg.innerText = "Error: Optimization failed. Try a smaller file.";
        } finally {
            generateBtn.disabled = false;
        }
    });

    // ... Keep your existing Export PDF Logic here ...
});
