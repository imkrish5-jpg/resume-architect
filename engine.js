document.addEventListener('DOMContentLoaded', () => {
    
    const loginBtn = document.getElementById('login-btn');
    const ctaBtn = document.getElementById('cta-btn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'app.html');
    if (ctaBtn) ctaBtn.addEventListener('click', () => window.location.href = 'app.html');

    const generateBtn = document.getElementById('generate-btn');
    const exportBtn = document.getElementById('export-pdf-btn');

    if (generateBtn) {
        
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
                const endpoint = `https://resume-architect.imkrish5.workers.dev/`;
                
                const prompt = `You are an elite executive resume writer. I am applying for the role of ${role} at ${company}. 
                Here are my raw, messy notes about my experience: "${notes}". 
                Rewrite these notes into 3 to 4 elite, past-tense bullet points designed to pass Applicant Tracking Systems (ATS). 
                Focus purely on strong action verbs and quantified business impact. 
                CRITICAL: Output ONLY the raw HTML <li> tags containing the bullets. Do not include <ul> tags. Do not use Markdown formatting like backticks or **bolding**. Provide nothing but the <li> tags.`;

                const payload = {
                    contents: [{ parts: [{ text: prompt }] }]
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                // X-RAY DIAGNOSTICS: Catching Google or Cloudflare errors directly
                if (data.error) {
                    throw new Error(`Google Error: ${data.error.message || JSON.stringify(data.error)}`);
                }
                
                if (!data.candidates) {
                    throw new Error(`Worker Error: Received unexpected data -> ${JSON.stringify(data)}`);
                }

                const aiText = data.candidates[0].content.parts[0].text;
                
                outputList.innerHTML = aiText;
                statusMsg.style.color = '#00ff00';
                statusMsg.innerText = "Success. Canvas updated.";

            } catch (error) {
                statusMsg.style.color = '#ff4444';
                statusMsg.innerText = error.message;
            } finally {
                generateBtn.disabled = false;
            }
        });
    }

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
