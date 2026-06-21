document.addEventListener('DOMContentLoaded', () => {
    
    // --- Routing / Auth Mock ---
    const loginBtn = document.getElementById('login-btn');
    const ctaBtn = document.getElementById('cta-btn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'app.html');
    if (ctaBtn) ctaBtn.addEventListener('click', () => window.location.href = 'app.html');

    // --- Workspace Logic ---
    const generateBtn = document.getElementById('generate-btn');
    const exportBtn = document.getElementById('export-pdf-btn');

    if (generateBtn) {
        
        // Live typing updates for the canvas headers
        const inputs = ['user-name', 'user-contact', 'job-title', 'job-company'];
        const targets = ['preview-name', 'preview-contact', 'preview-role', 'preview-company'];
        
        inputs.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    document.getElementById(targets[index]).innerText = e.target.value || el.placeholder;
                });
            }
        });

        // Backend AI Generation via Cloudflare Worker
        generateBtn.addEventListener('click', async () => {
            const role = document.getElementById('job-title').value.trim() || 'Software Engineer';
            const company = document.getElementById('job-company').value.trim() || 'Tech Corp';
            const notes = document.getElementById('raw-notes').value.trim();
            const statusMsg = document.getElementById('status-msg');
            const outputList = document.getElementById('preview-bullets');

            if (!notes) {
                statusMsg.style.color = '#ff4444';
                statusMsg.innerText = "Error: Please enter your raw notes.";
                return;
            }

            statusMsg.style.color = '#888';
            statusMsg.innerText = "Synthesizing notes securely... Please wait.";
            generateBtn.disabled = true;

            try {
                // Pointing to YOUR secure Cloudflare Worker instead of Google
                const endpoint = `https://resume-architect.imkrish5.workers.dev/`;
                
                const prompt = `You are an elite executive resume writer. I am applying for the role of ${role} at ${company}. 
                Here are my raw, messy notes about my experience: "${notes}". 
                Rewrite these notes into 3 to 4 elite, past-tense bullet points designed to pass Applicant Tracking Systems (ATS). 
                Focus purely on strong action verbs and quantified business impact. 
                CRITICAL: Output ONLY the raw HTML <li> tags containing the bullets. Do not include <ul> tags. Do not use Markdown formatting like backticks or **bolding**. Provide nothing but the <li> tags.`;

                // The payload structure matches exactly what Google expects
                const payload = {
                    contents: [{ parts: [{ text: prompt }] }]
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status}`);
                }

                const data = await response.json();
                
                // Extracting text from Google's response structure
                const aiText = data.candidates[0].content.parts[0].text;
                
                // Render directly into the DOM
                outputList.innerHTML = aiText;
                statusMsg.style.color = '#00ff00';
                statusMsg.innerText = "Success. Canvas updated.";

            } catch (error) {
                statusMsg.style.color = '#ff4444';
                statusMsg.innerText = "Error generating resume. Please try again.";
                console.error(error);
            } finally {
                generateBtn.disabled = false;
            }
        });
    }

    // --- PDF Export Logic ---
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const element = document.getElementById('resume-canvas');
            const name = document.getElementById('user-name').value.trim().replace(/\s+/g, '_') || 'Resume';
            
            const opt = {
                margin:       0,
                filename:     `${name}_Architect.pdf`,
                image:        { type: 'jpeg', quality: 1.0 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        });
    }
});
