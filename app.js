// Simple app for copying prompts
document.addEventListener('DOMContentLoaded', function() {
    // Copy button functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const promptCard = this.closest('.prompt-card');
            const promptText = promptCard.querySelector('.prompt-text').textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(promptText).then(() => {
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = '✅ Скопировано!';
                this.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = promptText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = '✅ Скопировано!';
                this.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                }, 2000);
            });
        });
    });

    // Smooth scrolling for better UX
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Set initial opacity for loading effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});