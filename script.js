document.addEventListener('DOMContentLoaded', () => {
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const flashcard = document.querySelector('.flashcard');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const flashcardContainer = document.getElementById('flashcard-container');
    const doneBtn = document.getElementById('done-btn');

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
            questionEl.textContent = 'Could not load flashcards.';
        }
    }

    function showCard(index) {
        if (flashcards.length === 0) return;
        flashcard.classList.remove('flipped');
        
        const currentQuestion = flashcards[index].Question;
        questionEl.textContent = currentQuestion;
        answerEl.textContent = flashcards[index].Answer;

        if (doneCards.includes(currentQuestion)) {
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
        const currentQuestion = flashcards[currentCardIndex].Question;
        const isDone = doneCards.includes(currentQuestion);

        if (isDone) {
            // It's done, so un-mark it
            doneCards = doneCards.filter(q => q !== currentQuestion);
            flashcard.classList.remove('done');
            doneBtn.textContent = 'Mark as Done';
            doneBtn.classList.remove('undone');
        } else {
            // It's not done, so mark it
            doneCards.push(currentQuestion);
            flashcard.classList.add('done');
            doneBtn.textContent = 'Mark as Un-done';
            doneBtn.classList.add('undone');
        }
        // Save the updated list to localStorage
        localStorage.setItem('doneCards', JSON.stringify(doneCards));
    });

    loadFlashcards();
}); 