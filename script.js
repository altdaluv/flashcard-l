document.addEventListener('DOMContentLoaded', () => {
    const flashcard = document.querySelector('.flashcard');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const flashcardContainer = document.getElementById('flashcard-container');
    const doneBtn = document.getElementById('done-btn');

    // Card face elements
    const frontHeader = document.getElementById('front-header');
    const frontSubheader = document.getElementById('front-subheader');
    const backHeader = document.getElementById('back-header');
    const backSubheader = document.getElementById('back-subheader');
    const backAdditional = document.getElementById('back-additional');

    let flashcards = [];
    let currentCardIndex = 0;
    let doneCards = JSON.parse(localStorage.getItem('doneCards')) || [];

    flashcardContainer.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });

    function parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            let obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            return obj;
        });
        return data;
    }

    async function loadFlashcards() {
        try {
            const response = await fetch('flashcards.csv');
            const csvData = await response.text();
            flashcards = parseCSV(csvData);
            if (flashcards.length > 0) {
                showCard(currentCardIndex);
            }
        } catch (error) {
            console.error('Error loading flashcards:', error);
            frontHeader.textContent = 'Could not load flashcards.';
        }
    }

    function showCard(index) {
        if (flashcards.length === 0) return;
        flashcard.classList.remove('flipped');
        
        const cardData = flashcards[index];
        const uniqueId = cardData['front-header'];

        frontHeader.textContent = uniqueId;
        frontSubheader.textContent = cardData['front-subheader'];
        backHeader.textContent = cardData['back-header'];
        backSubheader.textContent = cardData['back-subheader'];
        backAdditional.textContent = cardData['back-additional'];

        if (doneCards.includes(uniqueId)) {
            flashcard.classList.add('done');
            doneBtn.textContent = 'Mark as Un-done';
            doneBtn.classList.add('undone');
        } else {
            flashcard.classList.remove('done');
            doneBtn.textContent = 'Mark as Done';
            doneBtn.classList.remove('undone');
        }

        updateButtons();
    }

    function updateButtons() {
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === flashcards.length - 1;
    }

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            showCard(currentCardIndex);
        }
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            showCard(currentCardIndex);
        }
    });

    doneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uniqueId = flashcards[currentCardIndex]['front-header'];
        const isDone = doneCards.includes(uniqueId);

        if (isDone) {
            // It's done, so un-mark it
            doneCards = doneCards.filter(id => id !== uniqueId);
            flashcard.classList.remove('done');
            doneBtn.textContent = 'Mark as Done';
            doneBtn.classList.remove('undone');
        } else {
            // It's not done, so mark it
            doneCards.push(uniqueId);
            flashcard.classList.add('done');
            doneBtn.textContent = 'Mark as Un-done';
            doneBtn.classList.add('undone');
        }
        // Save the updated list to localStorage
        localStorage.setItem('doneCards', JSON.stringify(doneCards));
    });

    loadFlashcards();
}); 